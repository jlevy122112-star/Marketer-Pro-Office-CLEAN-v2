import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authGuard } from '../../common/middleware/authguard';
import { googleAdsService } from './googleads.service';
import type { AuthRequest } from '../../common/types';

const router = Router();

// GET /integrations/googleads/connect
router.get(
  '/connect',
  authGuard,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const url = googleAdsService.getOAuthUrl(req.user!.workspaceId);
      res.json({ url });
    } catch (err) {
      next(err);
    }
  },
);

// GET /integrations/googleads/callback
router.get(
  '/callback',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { code, state, error } = req.query as Record<string, string>;

      if (error) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=googleads_denied`,
        );
      }

      if (!code || !state) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=googleads_invalid`,
        );
      }

      const { workspaceId } = JSON.parse(Buffer.from(state, 'base64').toString());

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID ?? '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          redirect_uri: `${process.env.FRONTEND_URL}/api/integrations/googleads/callback`,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!tokenRes.ok) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=googleads_token_failed`,
        );
      }

      const tokens = await tokenRes.json();
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      await googleAdsService.storeTokens(
        workspaceId,
        tokens.access_token,
        tokens.refresh_token,
        expiresAt,
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/settings/integrations?success=googleads`,
      );
    } catch (err) {
      next(err);
    }
  },
);

// GET /integrations/googleads/status
router.get(
  '/status',
  authGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = await googleAdsService.getStatus(req.user!.workspaceId);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /integrations/googleads/disconnect
router.delete(
  '/disconnect',
  authGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await googleAdsService.disconnect(req.user!.workspaceId);
      res.json({ message: 'Google Ads disconnected' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
