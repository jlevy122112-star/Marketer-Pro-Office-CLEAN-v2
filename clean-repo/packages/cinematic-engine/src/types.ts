// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC ENGINE — TYPES
// Defines the three-act generation flow: Vault Door → Reactor → Presentation
// ─────────────────────────────────────────────────────────────────────────────

export type CinematicPhase =
  | 'idle'           // Nothing happening — Desk is in normal state
  | 'vault'          // Act I — Vault Door scene
  | 'reactor'        // Act II — Reactor Control scene
  | 'generating'     // API call in flight (overlaps with reactor fire)
  | 'presentation'   // Act III — Presentation Chamber scene
  | 'error';         // Generation failed — show error state in chamber

export type PlatformId =
  | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok'
  | 'youtube'  | 'pinterest' | 'snapchat';

export type ContentType =
  | 'post' | 'image_ad' | 'video_ad' | 'carousel' | 'story' | 'reel'
  | 'article' | 'email' | 'thread';

export type BrandTone =
  | 'professional' | 'casual' | 'playful' | 'authoritative'
  | 'inspirational' | 'educational' | 'witty' | 'luxury';

// ── Request — sent from the Desk generator form ─────────────────────────────
export interface GenerationRequest {
  brandId:          string;
  prompt:           string;
  contentType:      ContentType;
  platforms:        PlatformId[];
  tone:             BrandTone;
  includeHashtags:  boolean;
  includeAltText:   boolean;
  contentFilterEnabled: true; // Required by Apple 1.2 / Google AI policy — always true
}

// ── Artifact — one piece of generated content per platform ──────────────────
export interface GeneratedArtifact {
  id:               string;
  platform:         PlatformId;
  contentType:      ContentType;
  copy:             string;
  caption?:         string;
  hashtags:         string[];
  altText?:         string;
  adHeadline?:      string;
  adDescription?:   string;
  imagePrompt?:     string;
  imageUrl?:        string;
  characterCount:   number;
  optimized:        boolean;
  score:            number; // 0-100 quality score — used to sort artifacts
}

// ── Result — full response from /content/generate ──────────────────────────
export interface GenerationResult {
  id:        string;
  brandId:   string;
  prompt:    string;
  artifacts: GeneratedArtifact[];
  status:    'pending' | 'complete' | 'error';
  error?:    string;
  createdAt: string;
}

// ── Reactor switches — Act II arming sequence ────────────────────────────────
export type ReactorSwitchKey = 'brand' | 'audience' | 'ai_core';

export interface ReactorSwitchState {
  brand:    boolean;
  audience: boolean;
  ai_core:  boolean;
}

export const REACTOR_SWITCH_ORDER: ReactorSwitchKey[] = ['brand', 'audience', 'ai_core'];

// ── Engine context value — exposed to all scenes via provider ───────────────
export interface CinematicEngineState {
  phase:    CinematicPhase;
  request:  GenerationRequest | null;
  result:   GenerationResult | null;
  error:    string | null;
  switches: ReactorSwitchState;
}

export interface CinematicEngineActions {
  /** Begin the cinematic sequence — called from Desk generator form */
  start:        (request: GenerationRequest) => void;
  /** Vault Door scene calls this when its animation completes */
  vaultComplete: () => void;
  /** Toggle a reactor switch — sequential unlock enforced internally */
  toggleSwitch: (key: ReactorSwitchKey) => void;
  /** Pull the lever — only works when all switches armed */
  pullLever:    () => void;
  /** User cancels from Vault Door before committing */
  abort:        () => void;
  /** Return to Desk from Presentation Chamber — resets engine to idle */
  reset:        () => void;
  /** Retry generation with the same request after an error */
  retry:        () => void;
}

export type CinematicEngineContextValue = CinematicEngineState & CinematicEngineActions;

// ── Callbacks passed from the host app (Desk page) ───────────────────────────
export interface CinematicEngineCallbacks {
  /** Called with the real API call — engine awaits this during 'generating' */
  onGenerate: (request: GenerationRequest) => Promise<GenerationResult>;
  /** Called when user saves an artifact from the Presentation Chamber */
  onArtifactSave?: (artifact: GeneratedArtifact) => void;
  /** Called when user schedules an artifact (inline, non-destructive) */
  onSchedule?: (artifact: GeneratedArtifact, scheduledFor: string) => Promise<void>;
  /** Called when user reports content as objectionable — Apple 1.2 / Google AI policy */
  onReportContent?: (artifact: GeneratedArtifact, reason: string) => Promise<void>;
}
