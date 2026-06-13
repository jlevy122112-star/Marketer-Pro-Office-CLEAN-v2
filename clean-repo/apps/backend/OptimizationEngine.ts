/**
 * OptimizationEngine.ts
 * Core service interface for brand-injected, platform-optimized content delivery.
 */

// 8 Supported Social Platforms
export enum SocialPlatform {
  TIKTOK = 'TIKTOK',
  LINKEDIN = 'LINKEDIN',
  META = 'META',
  GOOGLE_ADS = 'GOOGLE_ADS',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  PINTEREST = 'PINTEREST',
  YOUTUBE = 'YOUTUBE'
}

export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  CAROUSEL = 'CAROUSEL'
}

export interface BrandingProfile {
  userId: string;
  logoUrl: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  fontFamily: string;
  watermarkSettings: {
    opacity: number;
    position: 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';
  };
}

export interface OptimizedArtifact {
  itemId: string;           // The unique tracking ID for analytics
  campaignId: string;       // Linked to the parent campaign
  platform: SocialPlatform;
  mediaUrl: string;         // The final processed URL
  caption: string;          // Platform-optimized text
  metadata: {
    aspectRatio: string;
    durationSeconds?: number;
    fileSizeKb: number;
    optimizationTags: string[];
  };
  version: number;          // For repurposing lineage
  createdAt: Date;
}

export interface OptimizationRequest {
  campaignId: string;
  rawContent: {
    type: MediaType;
    sourceUrl: string;
    rawText: string;
  };
  targetPlatforms: SocialPlatform[];
  branding: BrandingProfile;
}

export interface IOptimizationEngine {
  /**
   * Main entry point to transform raw AI output into platform-ready assets
   */
  optimize(request: OptimizationRequest): Promise<OptimizedArtifact[]>;

  /**
   * Internal method to overlay brand assets on media
   */
  applyBranding(
    mediaUrl: string, 
    branding: BrandingProfile, 
    type: MediaType
  ): Promise<string>;

  /**
   * Applies specific formatting (compression, crop, resizing) per platform
   */
  formatForPlatform(
    mediaUrl: string, 
    platform: SocialPlatform
  ): Promise<OptimizedArtifact>;

  /**
   * Retrieves specific artifact for repurposing based on itemId
   */
  getArtifactById(itemId: string): Promise<OptimizedArtifact | null>;
}
