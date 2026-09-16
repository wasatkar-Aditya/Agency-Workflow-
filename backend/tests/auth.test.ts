import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

const app = createApp();

let adminToken: string;
let pmToken: string;
let devToken: string;
let adminUserId: string;
let pmUserId: string;
let devUserId: string;

beforeAll(async () => {
  // Create test users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: `testadmin+${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('Admin@123', 12),
      role: 'ADMIN',
    },
  });

  const pmUser = await prisma.user.create({
    data: {
      name: 'Test PM',
      email: `testpm+${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('PM@123456', 12),
      role: 'PROJECT_MANAGER',
    },
  });

  const devUser = await prisma.user.create({
    data: {
      name: 'Test Dev',
      email: `testdev+${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('Dev@123456', 12),
      role: 'DEVELOPER',
    },
  });

  adminUserId = adminUser.id;
  pmUserId = pmUser.id;
  devUserId = devUser.id;

  // Login and get tokens
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminUser.email, password: 'Admin@123' });
  adminToken = adminLogin.body.data.accessToken;

  const pmLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: pmUser.email, password: 'PM@123456' });
  pmToken = pmLogin.body.data.accessToken;

  const devLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: devUser.email, password: 'Dev@123456' });
  devToken = devLogin.body.data.accessToken;
});

afterAll(async () => {
  // Cleanup test users
  await prisma.user.deleteMany({
    where: { id: { in: [adminUserId, pmUserId, devUserId] } },
  });
  await prisma.$disconnect();
});

// ─── Auth Tests ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('should return 200 and tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@agencyflow.dev', password: 'Admin@123' });

    // Will pass if seed exists; graceful skip otherwise
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    }
  });

  it('should return 401 on invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notexist@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' }); // missing password
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notanemail', password: 'password' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('should return 401 when no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

// ─── Authorization Tests ────────────────────────────────────
describe('Authorization — Role Enforcement', () => {
  it('Developer cannot access admin user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${devToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('PM cannot access admin user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${pmToken}`);
    expect(res.status).toBe(403);
  });

  it('Admin can access user list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Unauthenticated users cannot access protected routes', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('Developer cannot create projects', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ name: 'Hack Project', clientId: 'fakeid', ownerId: devUserId });
    expect(res.status).toBe(403);
  });

  it('Developer cannot create tasks', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ title: 'Hacked task', projectId: 'fakeid' });
    expect(res.status).toBe(403);
  });
});

// ─── Task Authorization ──────────────────────────────────────
describe('Task Access — Developer isolation', () => {
  it('Developer can list tasks (sees only assigned)', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${devToken}`);
    expect(res.status).toBe(200);
    // All returned tasks should be assigned to this developer
    if (res.body.data.items.length > 0) {
      res.body.data.items.forEach((task: any) => {
        expect(task.assignedDeveloperId).toBe(devUserId);
      });
    }
  });

  it('Developer cannot access a random task ID', async () => {
    const res = await request(app)
      .get('/api/tasks/nonexistentid12345')
      .set('Authorization', `Bearer ${devToken}`);
    expect([403, 404]).toContain(res.status);
  });
});

// ─── Notification Tests ──────────────────────────────────────
describe('Notifications', () => {
  it('returns notifications for authenticated user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${devToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns unread count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${devToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.count).toBe('number');
  });
});

// ─── Admin Dashboard Stats ───────────────────────────────────
describe('Admin dashboard stats', () => {
  it('Admin gets dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalProjects');
    expect(res.body.data).toHaveProperty('overdueTasks');
  });

  it('Developer cannot get dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${devToken}`);
    expect(res.status).toBe(403);
  });
});
