import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../common/types';
import { ppcService } from './ppc.service';

export const ppcController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { brandId } = req.query as { brandId?: string };
      const campaigns = await ppcService.list(req.user!.workspaceId, brandId);
      res.json({ campaigns });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await ppcService.getById(req.params.id, req.user!.workspaceId);
      res.json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await ppcService.create(req.user!.workspaceId, req.body);
      res.status(201).json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await ppcService.update(req.params.id, req.user!.workspaceId, req.body);
      res.json({ campaign });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ppcService.delete(req.params.id, req.user!.workspaceId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await ppcService.getMetrics(req.params.id, req.user!.workspaceId);
      res.json({ metrics });
    } catch (err) {
      next(err);
    }
  },

  async syncMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ppcService.syncMetrics(req.params.id, req.user!.workspaceId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
