import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/db';
import { NotFoundError, ValidationError } from '../common/errors';

export interface PpcCampaignPayload {
  brandId: string;
  name: string;
  platform: 'google' | 'meta';
  budget: number;
  objective: string;
  targetAudience?: Record<string, unknown>;
  keywords?: string[];
}

export const ppcService = {
  // GET /ppc/campaigns?brandId=
  async list(workspaceId: string, brandId?: string) {
    let query = supabase
      .from('ppc_campaigns')
      .select(`
        id, brand_id, name, platform, budget, objective, status,
        impressions, clicks, conversions, spend, roas,
        start_date, end_date, created_at, updated_at
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (brandId) query = query.eq('brand_id', brandId);

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch PPC campaigns');
    return data ?? [];
  },

  // GET /ppc/campaigns/:id
  async getById(id: string, workspaceId: string) {
    const { data } = await supabase
      .from('ppc_campaigns')
      .select(`
        *,
        ppc_ad_groups (
          id, name, status, daily_budget,
          ppc_ads ( id, headline, description, final_url, status, clicks, impressions )
        )
      `)
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!data) throw new NotFoundError('PPC Campaign');
    return data;
  },

  // POST /ppc/campaigns
  async create(workspaceId: string, payload: PpcCampaignPayload) {
    const { brandId, name, platform, budget, objective, targetAudience, keywords } = payload;

    if (!name?.trim()) throw new ValidationError('Campaign name is required');
    if (!budget || budget <= 0) throw new ValidationError('Budget must be greater than 0');
    if (!['google', 'meta'].includes(platform)) throw new ValidationError('Platform must be google or meta');

    const id = uuidv4();
    const { data, error } = await supabase
      .from('ppc_campaigns')
      .insert({
        id,
        workspace_id: workspaceId,
        brand_id: brandId,
        name: name.trim(),
        platform,
        budget,
        objective,
        target_audience: targetAudience ?? {},
        keywords: keywords ?? [],
        status: 'draft',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        roas: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('Failed to create PPC campaign');
    return data;
  },

  // PATCH /ppc/campaigns/:id
  async update(id: string, workspaceId: string, payload: Partial<PpcCampaignPayload & { status: string }>) {
    const { data: existing } = await supabase
      .from('ppc_campaigns')
      .select('id')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!existing) throw new NotFoundError('PPC Campaign');

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.budget !== undefined) updates.budget = payload.budget;
    if (payload.objective !== undefined) updates.objective = payload.objective;
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.targetAudience !== undefined) updates.target_audience = payload.targetAudience;
    if (payload.keywords !== undefined) updates.keywords = payload.keywords;

    const { data, error } = await supabase
      .from('ppc_campaigns')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('Failed to update PPC campaign');
    return data;
  },

  // DELETE /ppc/campaigns/:id
  async delete(id: string, workspaceId: string) {
    const { data: existing } = await supabase
      .from('ppc_campaigns')
      .select('id, status')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!existing) throw new NotFoundError('PPC Campaign');
    if (existing.status === 'active') throw new ValidationError('Cannot delete an active campaign. Pause it first.');

    await supabase.from('ppc_campaigns').delete().eq('id', id);
  },

  // GET /ppc/campaigns/:id/metrics
  async getMetrics(id: string, workspaceId: string) {
    const { data } = await supabase
      .from('ppc_campaigns')
      .select('impressions, clicks, conversions, spend, roas')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!data) throw new NotFoundError('PPC Campaign');

    const ctr = data.impressions > 0
      ? ((data.clicks / data.impressions) * 100).toFixed(2)
      : '0.00';

    const cpc = data.clicks > 0
      ? (data.spend / data.clicks).toFixed(2)
      : '0.00';

    const conversionRate = data.clicks > 0
      ? ((data.conversions / data.clicks) * 100).toFixed(2)
      : '0.00';

    return {
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      spend: data.spend,
      roas: data.roas,
      ctr: parseFloat(ctr),
      cpc: parseFloat(cpc),
      conversionRate: parseFloat(conversionRate),
    };
  },

  // POST /ppc/campaigns/:id/sync — pull live metrics from platform
  async syncMetrics(id: string, workspaceId: string) {
    const { data: campaign } = await supabase
      .from('ppc_campaigns')
      .select('platform, external_id, workspace_id')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!campaign) throw new NotFoundError('PPC Campaign');
    if (!campaign.external_id) return { synced: false, reason: 'Not yet published to platform' };

    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('workspace_id', workspaceId)
      .eq('provider', campaign.platform === 'google' ? 'googleads' : 'meta')
      .single();

    if (!integration?.access_token) {
      return { synced: false, reason: 'Platform not connected' };
    }

    // Platform-specific metric sync
    let metrics: Record<string, number> = {};

    if (campaign.platform === 'meta') {
      const params = new URLSearchParams({
        fields: 'impressions,clicks,spend,actions',
        access_token: integration.access_token,
      });
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${campaign.external_id}/insights?${params}`,
      );
      if (res.ok) {
        const raw = await res.json();
        const d = raw.data?.[0] ?? {};
        metrics = {
          impressions: parseInt(d.impressions ?? '0'),
          clicks: parseInt(d.clicks ?? '0'),
          spend: parseFloat(d.spend ?? '0'),
          conversions: d.actions?.find((a: { action_type: string }) => a.action_type === 'purchase')?.value ?? 0,
        };
      }
    } else if (campaign.platform === 'google') {
      // Google Ads API v15 — simplified query
      const res = await fetch(
        `https://googleads.googleapis.com/v15/customers/-/googleAds:searchStream`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json',
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
          },
          body: JSON.stringify({
            query: `SELECT campaign.id, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE campaign.resource_name = 'customers/-/campaigns/${campaign.external_id}'`,
          }),
        },
      );
      if (res.ok) {
        const raw = await res.json();
        const row = raw[0]?.results?.[0];
        if (row) {
          metrics = {
            impressions: row.metrics?.impressions ?? 0,
            clicks: row.metrics?.clicks ?? 0,
            spend: (row.metrics?.costMicros ?? 0) / 1_000_000,
            conversions: row.metrics?.conversions ?? 0,
          };
        }
      }
    }

    if (Object.keys(metrics).length > 0) {
      const roas = metrics.spend > 0 && metrics.conversions > 0
        ? ((metrics.conversions * 50) / metrics.spend) // estimate: $50 avg order value
        : 0;

      await supabase
        .from('ppc_campaigns')
        .update({ ...metrics, roas, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    return { synced: true, metrics };
  },
};
