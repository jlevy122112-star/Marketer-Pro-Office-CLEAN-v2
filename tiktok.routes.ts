import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authGuard } from '../../common/middleware/authguard';
import { tiktokService } from './tiktok.service';
import type { AuthRequest } from '../../common/types';

const router = Router();

// GET /integrations/tiktok/connect — returns OAuth URL
router.get(
  '/connect',
  authGuard,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const url = tiktokService.getOAuthUrl(req.user!.workspaceId);
      res.json({ url });
    } catch (err) {
      next(err);
    }
  },
);

// GET /integrations/tiktok/callback — OAuth redirect handler
router.get(
  '/callback',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { code, state, error } = req.query as Record<string, string>;

      if (error) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=tiktok_denied`,
        );
      }

      if (!code || !state) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=tiktok_invalid`,
        );
      }

      const { workspaceId } = JSON.parse(Buffer.from(state, 'base64').toString());

      // Exchange code for tokens
      const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY ?? '',
          client_secret: process.env.TIKTOK_CLIENT_SECRET ?? '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.FRONTEND_URL}/api/integrations/tiktok/callback`,
        }).toString(),
      });

      if (!tokenRes.ok) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=tiktok_token_failed`,
        );
      }

      const tokens = await tokenRes.json();
      await tiktokService.storeTokens(
        workspaceId,
        tokens.access_token,
        tokens.refresh_token,
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/settings/integrations?success=tiktok`,
      );
    } catch (err) {
      next(err);
    }
  },
);

// GET /integrations/tiktok/status
router.get(
  '/status',
  authGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = await tiktokService.getStatus(req.user!.workspaceId);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /integrations/tiktok/disconnect
router.delete(
  '/disconnect',
  authGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await tiktokService.disconnect(req.user!.workspaceId);
      res.json({ message: 'TikTok disconnected' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
