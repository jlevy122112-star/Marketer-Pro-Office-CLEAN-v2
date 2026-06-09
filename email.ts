/**
 * email.ts
 * Marketer Pro — Email notification service.
 * Wired to Resend (https://resend.com) for transactional emails.
 *
 * Templates referenced:
 *   plan-changed
 *   subscription-ended
 *   payment-failed
 *   payment-action-required
 *   trial-ending
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set — email skipped:', options.subject);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Marketer Pro <noreply@marketerprooffice.com>',
        to: options.to,
        subject: options.subject,
        html: renderTemplate(options.template, options.data),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Email] Send failed:', err);
    }
  } catch (err) {
    console.error('[Email] Network error:', err);
    // Non-fatal — don't throw. Payment flow must not break on email failure.
  }
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  // Simple template renderer — replace with React Email or Handlebars in production
  const templates: Record<string, (d: any) => string> = {
    'plan-changed': (d) => `
      <p>Your Marketer Pro plan has been updated.</p>
      <p>Status: ${d.status}</p>
      <p><a href="${process.env.APP_URL}/settings/billing">View billing</a></p>
    `,
    'subscription-ended': (d) => `
      <p>Your Marketer Pro subscription ended on ${d.endedAt}.</p>
      <p>Your content and vault are saved. <a href="${process.env.APP_URL}/settings/billing">Reactivate</a> anytime.</p>
    `,
    'payment-failed': (d) => `
      <p>We couldn't process your payment of ${d.amount}.</p>
      <p><a href="${d.portalUrl}">Update your payment method</a> to keep your workspace running.</p>
    `,
    'payment-action-required': (d) => `
      <p>Your bank requires you to authorize this payment.</p>
      <p><a href="${d.actionUrl}">Authorize payment</a></p>
    `,
    'trial-ending': (d) => `
      <p>Your Marketer Pro trial ends in ${d.daysLeft} days.</p>
      <p><a href="${d.upgradeUrl}">Upgrade now</a> to keep unlimited access.</p>
    `,
  };

  return templates[template]?.(data) ?? `<p>${JSON.stringify(data)}</p>`;
}
