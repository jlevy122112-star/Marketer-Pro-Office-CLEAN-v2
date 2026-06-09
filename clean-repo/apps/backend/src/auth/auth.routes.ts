import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// POST /auth/signup
router.post('/signup', authController.signup);

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/refresh
router.post('/refresh', authController.refresh);

// POST /auth/logout
router.post('/logout', authController.logout);

// POST /auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', authController.resetPassword);

export default router;
// apply rate limiter to all requests
app.use(limiter);

app.get('/:path', function(req, res) {
  let path = req.params.path;
  if (isValidPath(path))
    res.sendFile(path);
});
