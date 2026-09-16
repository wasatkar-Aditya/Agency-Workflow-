import { prisma } from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  comparePassword,
  getRefreshTokenExpiry,
} from '../utils/tokens';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../errors/AppError';
import { config } from '../config/config';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

import { Role } from '@prisma/client';

export class AuthService {
  async register(name: string, email: string, password: string, role: Role = Role.DEVELOPER) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('User with this email already exists');

    const passwordHash = await hashPassword(password);
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=06b6d4`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        avatarUrl,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role, user.email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new ForbiddenError('Account is deactivated');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const accessToken = generateAccessToken(user.id, user.role, user.email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) throw new UnauthorizedError('Refresh token required');

    const tokenHash = hashRefreshToken(rawRefreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedError('Invalid refresh token');
    if (stored.revokedAt) throw new UnauthorizedError('Refresh token has been revoked');
    if (stored.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired');
    if (!stored.user.isActive) throw new ForbiddenError('Account is deactivated');

    // Rotate — revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = generateRefreshToken();
    const newHash = hashRefreshToken(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: newHash,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const accessToken = generateAccessToken(stored.user.id, stored.user.role, stored.user.email);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;
    const tokenHash = hashRefreshToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true, avatarUrl: true,
        isActive: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }
}

export const authService = new AuthService();
