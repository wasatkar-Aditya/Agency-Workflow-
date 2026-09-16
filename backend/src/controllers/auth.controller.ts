import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/schemas';
import { successResponse } from '../utils/tokens';
import { config } from '../config/config';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = registerSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.register(
        body.name,
        body.email,
        body.password,
        body.role
      );

      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.status(201).json(successResponse({ accessToken, user }, 'Registration successful'));
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.login(body.email, body.password);

      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.json(successResponse({ accessToken, user }, 'Login successful'));
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const raw = req.cookies[REFRESH_COOKIE] as string | undefined;
      if (!raw) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token required' } }); return; }

      const { accessToken, refreshToken } = await authService.refresh(raw);

      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.json(successResponse({ accessToken }, 'Token refreshed'));
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const raw = req.cookies[REFRESH_COOKIE] as string | undefined;
      if (raw) await authService.logout(raw);
      res.clearCookie(REFRESH_COOKIE);
      res.json(successResponse(null, 'Logged out successfully'));
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(successResponse(user));
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
