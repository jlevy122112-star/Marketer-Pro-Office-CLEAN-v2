/**
 * BullMQ-backed job queue.
 * Replaces the previous in-memory stub with Redis-persisted, retryable jobs.
 *
 * Queues:
 *   - publish_content   Content publishing to social platforms
 *   - fetch_metrics     Periodic analytics sync
 *   - send_email        Transactional emails (password reset, welcome, etc.)
 *   - ai_generation     Async Claude AI content generation jobs
 *
 * Redis connection string comes from env.REDIS_URL (Railway).
 * Falls back gracefully in development if Redis is unavailable.
 */

import { Queue, Worker, QueueEvents, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../common/logger';

// ─── Redis connection ────────────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

let connection: IORedis;
try {
  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,   // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  });

  connection.on('error', (err) => {
    logger.warn('Redis connection error (queue will degrade gracefully):', err.message);
  });
} catch (err) {
  logger.warn('Redis unavailable — job queue running in degraded mode');
}

// ─── Shared connection options ────────────────────────────────────────────────
export const connectionOptions: ConnectionOptions = connection!;

// ─── Default job options ──────────────────────────────────────────────────────
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2_000,        // 2s, 4s, 8s
  },
  removeOnComplete: { count: 500 },
  removeOnFail:     { age: 7 * 24 * 3600 },  // Keep failures for 7 days
};

// ─── Queue definitions ────────────────────────────────────────────────────────

/** Publishes a scheduled post to a social platform */
export const publishContentQueue = new Queue('publish_content', {
  connection: connectionOptions,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

/** Fetches analytics metrics from connected platforms */
export const fetchMetricsQueue = new Queue('fetch_metrics', {
  connection: connectionOptions,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 5,
  },
});

/** Sends transactional emails (Resend/Supabase SMTP) */
export const sendEmailQueue = new Queue('send_email', {
  connection: connectionOptions,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 5,
  },
});

/** Runs AI content generation asynchronously for large batches */
export const aiGenerationQueue = new Queue('ai_generation', {
  connection: connectionOptions,
  defaultJobOptions: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 2,                // AI calls are expensive — limit retries
    removeOnComplete: { count: 200 },
  },
});

// ─── Typed job payloads ───────────────────────────────────────────────────────

export interface PublishContentJobData {
  contentItemId: string;
  platform: string;
  workspaceId: string;
  accessToken: string;
  caption: string;
  imageUrls: string[];
  hashtags: string[];
}

export interface FetchMetricsJobData {
  workspaceId: string;
  provider: 'meta' | 'tiktok' | 'linkedin' | 'googleads';
  since: string;    // ISO date string
}

export interface SendEmailJobData {
  to: string;
  subject: string;
  template: 'welcome' | 'password_reset' | 'subscription_upgraded' | 'post_published' | 'weekly_digest';
  variables: Record<string, string | number>;
}

export interface AiGenerationJobData {
  generationId: string;
  brandId: string;
  userId: string;
  prompt: string;
  platforms: string[];
  contentType: string;
  tone: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Schedule a content item to be published at a future time.
 * Uses BullMQ's built-in delay: job fires at the scheduled timestamp.
 */
export async function scheduleContentPublish(
  data: PublishContentJobData,
  publishAt: Date,
): Promise<void> {
  const delay = Math.max(0, publishAt.getTime() - Date.now());
  await publishContentQueue.add('publish', data, {
    delay,
    jobId: `publish-${data.contentItemId}`,  // Idempotent — won't duplicate
  });
  logger.info(`Scheduled publish job for content ${data.contentItemId} at ${publishAt.toISOString()}`);
}

/**
 * Cancel a previously scheduled publish job.
 */
export async function cancelScheduledPublish(contentItemId: string): Promise<void> {
  const job = await publishContentQueue.getJob(`publish-${contentItemId}`);
  if (job) {
    await job.remove();
    logger.info(`Cancelled publish job for content ${contentItemId}`);
  }
}

/**
 * Enqueue a transactional email.
 */
export async function enqueueEmail(data: SendEmailJobData): Promise<void> {
  await sendEmailQueue.add(data.template, data, {
    priority: data.template === 'password_reset' ? 1 : 5,
  });
}

/**
 * Enqueue an async AI generation job.
 */
export async function enqueueAiGeneration(data: AiGenerationJobData): Promise<void> {
  await aiGenerationQueue.add('generate', data, {
    jobId: `gen-${data.generationId}`,
  });
}

/**
 * Register daily metric sync for all connected workspaces.
 * Called once at startup by the scheduler.
 */
export async function registerRecurringJobs(): Promise<void> {
  // Daily metrics sync at 3am UTC
  await fetchMetricsQueue.add(
    'daily-sync',
    { workspaceId: '__all__', provider: 'meta', since: '' },
    {
      repeat: { pattern: '0 3 * * *', tz: 'UTC' },
      jobId: 'daily-metrics-sync',
    },
  );

  // Weekly digest emails — Monday 8am UTC
  await sendEmailQueue.add(
    'weekly_digest',
    { to: '__broadcast__', subject: 'Your Weekly Marketing Report', template: 'weekly_digest', variables: {} },
    {
      repeat: { pattern: '0 8 * * 1', tz: 'UTC' },
      jobId: 'weekly-digest-broadcast',
    },
  );

  logger.info('Recurring BullMQ jobs registered');
}

// ─── Queue event listeners (for logging/monitoring) ───────────────────────────
const publishEvents = new QueueEvents('publish_content', { connection: connectionOptions });
publishEvents.on('completed', ({ jobId }) => logger.info(`✓ publish_content ${jobId} completed`));
publishEvents.on('failed', ({ jobId, failedReason }) =>
  logger.error(`✗ publish_content ${jobId} failed: ${failedReason}`));

const emailEvents = new QueueEvents('send_email', { connection: connectionOptions });
emailEvents.on('failed', ({ jobId, failedReason }) =>
  logger.error(`✗ send_email ${jobId} failed: ${failedReason}`));

export { connection as redisConnection };
