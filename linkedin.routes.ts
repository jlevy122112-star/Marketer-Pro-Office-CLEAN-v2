import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { authGuard } from '../../common/middleware/authguard';
import { linkedinService } from './linkedin.service';
import type { AuthRequest } from '../../common/types';

const router = Router();

// GET /integrations/linkedin/connect
router.get(
  '/connect',
  authGuard,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const url = linkedinService.getOAuthUrl(req.user!.workspaceId);
      res.json({ url });
    } catch (err) {
      next(err);
    }
  },
);

// GET /integrations/linkedin/callback
router.get(
  '/callback',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { code, state, error } = req.query as Record<string, string>;

      if (error) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=linkedin_denied`,
        );
      }

      if (!code || !state) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=linkedin_invalid`,
        );
      }

      const { workspaceId } = JSON.parse(Buffer.from(state, 'base64').toString());

      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.FRONTEND_URL}/api/integrations/linkedin/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
          client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
        }).toString(),
      });

      if (!tokenRes.ok) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/settings/integrations?error=linkedin_token_failed`,
        );
      }

      const tokens = await tokenRes.json();
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      await linkedinService.storeTokens(
        workspaceId,
        tokens.access_token,
        tokens.refresh_token,
        expiresAt,
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/settings/integrations?success=linkedin`,
      );
    } catch (err) {
      next(err);
    }
  },
);

// GET /integrations/linkedin/status
router.get(
  '/status',
  authGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = await linkedinService.getStatus(req.user!.workspaceId);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /integrations/linkedin/disconnect
router.delete(
  '/disconnect',
  authGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await linkedinService.disconnect(req.user!.workspaceId);
      res.json({ message: 'LinkedIn disconnected' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
