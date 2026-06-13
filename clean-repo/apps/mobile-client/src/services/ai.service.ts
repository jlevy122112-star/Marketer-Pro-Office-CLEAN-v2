import { supabase } from '../lib/supabase'; // Adjust based on your actual path
import { PostgrestError } from '@supabase/supabase-js';

export interface GenerationRequest {
  brandId: string;
  topic: string;
  contentType: 'post' | 'caption' | 'thread';
  platforms: string[];
  tone: 'professional' | 'casual' | 'witty';
}

export interface GeneratedArtifact {
  id: string;
  content: string;
  platform: string;
}

export const aiService = {
  async generateContent(request: GenerationRequest): Promise<GeneratedArtifact[]> {
    const { data, error } = await supabase.functions.invoke<{ artifacts: GeneratedArtifact[] }>('generate-content', {
      body: request,
    });

    if (error) throw error;

    // Async log to usage_events without blocking the UI response
    supabase.from('usage_events').insert({
      event_type: 'ai_generation',
      metadata: { contentType: request.contentType, platforms: request.platforms },
    }).catch(console.error);

    return data?.artifacts || [];
  },

  async optimizeContent(content: string, platform: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke<{ optimizedContent: string }>('optimize-content', {
      body: { content, platform }
    });
    return data?.optimizedContent ?? content;
  }
};
