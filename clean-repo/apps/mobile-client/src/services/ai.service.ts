import { supabase } from '../lib/supabase';

export interface GenerationRequest {
  brandId: string;
  topic: string;
  contentType: 'post' | 'caption' | 'thread';
  platforms: string[];
  tone: 'professional' | 'casual' | 'witty';
}

export const aiService = {
  async generateContent(request: GenerationRequest) {
    const { data, error } = await supabase.functions.invoke('generate-content', { body: request });
    if (error) throw error;
    
    await supabase.from('usage_events').insert({
      event_type: 'ai_generation',
      metadata: { contentType: request.contentType }
    });
    return data.artifacts;
  }
};
