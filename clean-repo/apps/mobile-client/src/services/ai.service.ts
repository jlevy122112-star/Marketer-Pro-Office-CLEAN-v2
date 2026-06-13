import { supabase } from '../lib/supabase';
import type { GenerationRequest, GeneratedArtifact } from '../types';

export const aiService = {
  async generateContent(request: GenerationRequest): Promise<GeneratedArtifact[]> {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: request,
    });
    
    if (error) throw new Error(error.message);
    
    // Log usage for the reward engine/billing guard
    await supabase.from('usage_events').insert({
      event_type: 'ai_generation',
      metadata: { contentType: request.contentType, platforms: request.platforms }
    });

    return data.artifacts;
  },

  async optimizeContent(content: string, platform: string): Promise<string> {
    // Call Edge Function for platform-specific optimization (e.g., character limits, hashtags)
    const { data, error } = await supabase.functions.invoke('optimize-content', {
      body: { content, platform }
    });
    return data?.optimizedContent ?? content;
  }
};
