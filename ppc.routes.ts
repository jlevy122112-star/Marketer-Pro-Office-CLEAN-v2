import { Router } from 'express';
import { authGuard } from '../common/middleware/authguard';
import { ppcController } from './ppc.controller';

const router = Router();

// GET    /ppc/campaigns?brandId=
router.get('/campaigns', authGuard, ppcController.list);

// POST   /ppc/campaigns
router.post('/campaigns', authGuard, ppcController.create);

// GET    /ppc/campaigns/:id
router.get('/campaigns/:id', authGuard, ppcController.getById);

// PATCH  /ppc/campaigns/:id
router.patch('/campaigns/:id', authGuard, ppcController.update);

// DELETE /ppc/campaigns/:id
router.delete('/campaigns/:id', authGuard, ppcController.delete);

// GET    /ppc/campaigns/:id/metrics
router.get('/campaigns/:id/metrics', authGuard, ppcController.getMetrics);

// POST   /ppc/campaigns/:id/sync
router.post('/campaigns/:id/sync', authGuard, ppcController.syncMetrics);

export default router;
