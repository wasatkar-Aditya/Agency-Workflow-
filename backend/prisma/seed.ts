/**
 * AgencyFlow Seed Script
 *
 * Creates:
 * - 1 Admin
 * - 2 Project Managers
 * - 4 Developers
 * - 3 Clients
 * - 3 Projects (with tasks, activity logs, notifications)
 *
 * Development credentials documented below.
 * DO NOT use these in production.
 */

import { PrismaClient, Role, ProjectStatus, TaskStatus, TaskPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // ─── USERS ────────────────────────────────────────────
  console.log('Creating users...');

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@agencyflow.dev',
      passwordHash: await hash('Admin@123'),
      role: Role.ADMIN,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5`,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@agencyflow.dev',
      passwordHash: await hash('PM@123456'),
      role: Role.PROJECT_MANAGER,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9`,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Marco Rossi',
      email: 'marco@agencyflow.dev',
      passwordHash: await hash('PM@123456'),
      role: Role.PROJECT_MANAGER,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=MR&backgroundColor=8b5cf6`,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Amit Kumar',
      email: 'amit@agencyflow.dev',
      passwordHash: await hash('Dev@123456'),
      role: Role.DEVELOPER,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=AK&backgroundColor=10b981`,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@agencyflow.dev',
      passwordHash: await hash('Dev@123456'),
      role: Role.DEVELOPER,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=SC&backgroundColor=f59e0b`,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul@agencyflow.dev',
      passwordHash: await hash('Dev@123456'),
      role: Role.DEVELOPER,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=RV&backgroundColor=ef4444`,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Lisa Park',
      email: 'lisa@agencyflow.dev',
      passwordHash: await hash('Dev@123456'),
      role: Role.DEVELOPER,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=LP&backgroundColor=06b6d4`,
    },
  });

  console.log('✓ Users created');

  // ─── CLIENTS ──────────────────────────────────────────
  console.log('Creating clients...');

  const client1 = await prisma.client.create({
    data: {
      name: 'TechNova Solutions',
      companyName: 'TechNova Solutions Ltd',
      email: 'contact@technova.com',
      phone: '+1-555-0101',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'FinEdge Capital',
      companyName: 'FinEdge Capital Group',
      email: 'projects@finedge.io',
      phone: '+1-555-0202',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'MediCare Plus',
      companyName: 'MediCare Plus Inc',
      email: 'it@medicareplus.com',
      phone: '+1-555-0303',
    },
  });

  console.log('✓ Clients created');

  // ─── PROJECTS ─────────────────────────────────────────
  console.log('Creating projects...');

  const now = new Date();
  const past = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const future = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform Rebuild',
      description: 'Complete rebuild of TechNova\'s e-commerce platform with modern React frontend and Node.js API.',
      clientId: client1.id,
      ownerId: pm1.id,
      status: ProjectStatus.ACTIVE,
      startDate: past(30),
      dueDate: future(60),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Financial Dashboard Suite',
      description: 'Real-time financial data visualization dashboard for FinEdge Capital internal use.',
      clientId: client2.id,
      ownerId: pm2.id,
      status: ProjectStatus.ACTIVE,
      startDate: past(45),
      dueDate: future(30),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Patient Portal Integration',
      description: 'HIPAA-compliant patient portal integration with EHR systems for MediCare Plus.',
      clientId: client3.id,
      ownerId: pm1.id,
      status: ProjectStatus.PLANNING,
      startDate: future(7),
      dueDate: future(90),
    },
  });

  console.log('✓ Projects created');

  // ─── TASKS — Project 1 ────────────────────────────────
  console.log('Creating tasks...');

  const task1 = await prisma.task.create({
    data: {
      title: 'Set up React project architecture',
      description: 'Initialize Vite + React + TypeScript with proper folder structure, ESLint, Prettier.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      createdById: pm1.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: past(20),
      completedAt: past(21),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design product listing API',
      description: 'RESTful endpoints for product catalog with filtering, pagination, and search.',
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      createdById: pm1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: future(5),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Implement shopping cart logic',
      description: 'Cart service with add/remove/update items, persist to localStorage, sync with backend.',
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      createdById: pm1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: future(15),
    },
  });

  // Overdue task 1
  const task4 = await prisma.task.create({
    data: {
      title: 'Payment gateway integration',
      description: 'Stripe integration with webhook handling and payment confirmation flows.',
      projectId: project1.id,
      assignedDeveloperId: dev3.id,
      createdById: pm1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: past(5), // OVERDUE
      isOverdue: true,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Write product API unit tests',
      description: 'Vitest unit tests for all product service methods with 80%+ coverage.',
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      createdById: pm1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: future(25),
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Mobile responsive layout',
      description: 'Ensure all pages are fully responsive for mobile and tablet viewports.',
      projectId: project1.id,
      assignedDeveloperId: dev4.id,
      createdById: pm1.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: future(3),
    },
  });

  // ─── TASKS — Project 2 ────────────────────────────────
  const task7 = await prisma.task.create({
    data: {
      title: 'Real-time data pipeline setup',
      description: 'WebSocket-based real-time feed for stock prices and financial indices.',
      projectId: project2.id,
      assignedDeveloperId: dev1.id,
      createdById: pm2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: future(10),
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Recharts dashboard components',
      description: 'Build interactive chart components: line chart, candlestick, portfolio pie.',
      projectId: project2.id,
      assignedDeveloperId: dev4.id,
      createdById: pm2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: future(8),
    },
  });

  // Overdue task 2
  const task9 = await prisma.task.create({
    data: {
      title: 'Authentication & role management',
      description: 'JWT-based auth with RBAC for Analyst, Manager, and Admin roles.',
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      createdById: pm2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: past(3), // OVERDUE
      isOverdue: true,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      title: 'Portfolio performance calculations',
      description: 'Backend service for ROI, P/L, Sharpe ratio, and sector allocation computations.',
      projectId: project2.id,
      assignedDeveloperId: dev2.id,
      createdById: pm2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: future(20),
    },
  });

  const task11 = await prisma.task.create({
    data: {
      title: 'Export to PDF/Excel functionality',
      description: 'Report generation feature for portfolio snapshots.',
      projectId: project2.id,
      assignedDeveloperId: dev4.id,
      createdById: pm2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: future(25),
    },
  });

  // ─── TASKS — Project 3 ────────────────────────────────
  const task12 = await prisma.task.create({
    data: {
      title: 'Requirements gathering & HL design',
      description: 'Collect requirements from MediCare stakeholders and produce HLD document.',
      projectId: project3.id,
      assignedDeveloperId: dev1.id,
      createdById: pm1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: future(14),
    },
  });

  const task13 = await prisma.task.create({
    data: {
      title: 'HIPAA compliance checklist',
      description: 'Document all HIPAA requirements and map to implementation tasks.',
      projectId: project3.id,
      assignedDeveloperId: dev3.id,
      createdById: pm1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: future(10),
    },
  });

  const task14 = await prisma.task.create({
    data: {
      title: 'EHR API integration spec',
      description: 'Define API contracts for HL7 FHIR integration with Epic EHR.',
      projectId: project3.id,
      assignedDeveloperId: dev2.id,
      createdById: pm1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: future(21),
    },
  });

  const task15 = await prisma.task.create({
    data: {
      title: 'Database schema design',
      description: 'Design normalized PostgreSQL schema for patient records, appointments, and documents.',
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      createdById: pm1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: future(28),
    },
  });

  console.log('✓ Tasks created');

  // ─── ACTIVITY LOGS ────────────────────────────────────
  console.log('Creating activity logs...');

  const activityData = [
    {
      actorId: admin.id,
      projectId: project1.id,
      eventType: 'project.created',
      message: 'Alex Admin created project "E-Commerce Platform Rebuild"',
      metadata: { projectId: project1.id },
      createdAt: past(30),
    },
    {
      actorId: pm1.id,
      projectId: project1.id,
      taskId: task1.id,
      eventType: 'task.created',
      message: 'Priya Sharma created task "Set up React project architecture"',
      metadata: {},
      createdAt: past(28),
    },
    {
      actorId: pm1.id,
      projectId: project1.id,
      taskId: task1.id,
      eventType: 'task.assigned',
      message: 'Priya Sharma assigned "Set up React project architecture" to Amit Kumar',
      metadata: { assignedDeveloperId: dev1.id },
      createdAt: past(28),
    },
    {
      actorId: dev1.id,
      projectId: project1.id,
      taskId: task1.id,
      eventType: 'task.status_changed',
      message: 'Amit Kumar changed "Set up React project architecture" status to DONE',
      metadata: { from: 'IN_PROGRESS', to: 'DONE' },
      createdAt: past(21),
    },
    {
      actorId: pm2.id,
      projectId: project2.id,
      eventType: 'project.created',
      message: 'Marco Rossi created project "Financial Dashboard Suite"',
      metadata: { projectId: project2.id },
      createdAt: past(45),
    },
    {
      actorId: pm2.id,
      projectId: project2.id,
      taskId: task9.id,
      eventType: 'task.overdue',
      message: 'Task "Authentication & role management" is overdue',
      metadata: { taskId: task9.id },
      createdAt: past(1),
    },
    {
      actorId: pm1.id,
      projectId: project1.id,
      taskId: task4.id,
      eventType: 'task.overdue',
      message: 'Task "Payment gateway integration" is overdue',
      metadata: { taskId: task4.id },
      createdAt: past(5),
    },
    {
      actorId: dev4.id,
      projectId: project1.id,
      taskId: task6.id,
      eventType: 'task.status_changed',
      message: 'Lisa Park changed "Mobile responsive layout" status to IN_REVIEW',
      metadata: { from: 'IN_PROGRESS', to: 'IN_REVIEW' },
      createdAt: past(2),
    },
  ];

  for (const activity of activityData) {
    await prisma.activityLog.create({ data: activity });
  }

  console.log('✓ Activity logs created');

  // ─── NOTIFICATIONS ────────────────────────────────────
  console.log('Creating notifications...');

  const notifData = [
    {
      userId: dev1.id,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: 'You have been assigned to "Set up React project architecture"',
      taskId: task1.id,
      projectId: project1.id,
      isRead: true,
      readAt: past(27),
    },
    {
      userId: dev3.id,
      type: NotificationType.TASK_OVERDUE,
      title: 'Task Overdue',
      message: '"Payment gateway integration" is overdue. Please update its status.',
      taskId: task4.id,
      projectId: project1.id,
      isRead: false,
    },
    {
      userId: pm1.id,
      type: NotificationType.TASK_OVERDUE,
      title: 'Task Overdue',
      message: '"Payment gateway integration" in project "E-Commerce Platform Rebuild" is overdue.',
      taskId: task4.id,
      projectId: project1.id,
      isRead: false,
    },
    {
      userId: dev3.id,
      type: NotificationType.TASK_OVERDUE,
      title: 'Task Overdue',
      message: '"Authentication & role management" is overdue. Please update its status.',
      taskId: task9.id,
      projectId: project2.id,
      isRead: false,
    },
    {
      userId: pm2.id,
      type: NotificationType.TASK_OVERDUE,
      title: 'Task Overdue',
      message: '"Authentication & role management" in project "Financial Dashboard Suite" is overdue.',
      taskId: task9.id,
      projectId: project2.id,
      isRead: false,
    },
    {
      userId: dev4.id,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: 'You have been assigned to "Mobile responsive layout"',
      taskId: task6.id,
      projectId: project1.id,
      isRead: true,
      readAt: past(4),
    },
  ];

  for (const n of notifData) {
    await prisma.notification.create({ data: n });
  }

  console.log('✓ Notifications created');

  // ─── TASK COMMENTS ────────────────────────────────────
  console.log('Creating task comments...');

  await prisma.taskComment.createMany({
    data: [
      {
        taskId: task2.id,
        userId: dev2.id,
        content: 'Started working on the product listing endpoints. Will have v1 ready by EOD.',
        createdAt: past(3),
        updatedAt: past(3),
      },
      {
        taskId: task2.id,
        userId: pm1.id,
        content: 'Great! Make sure to add proper pagination headers and include total count.',
        createdAt: past(2),
        updatedAt: past(2),
      },
      {
        taskId: task4.id,
        userId: dev3.id,
        content: 'Stripe sandbox integration done. Working on webhook handling.',
        createdAt: past(6),
        updatedAt: past(6),
      },
      {
        taskId: task4.id,
        userId: pm1.id,
        content: 'This is marked as overdue! Please provide an update on the timeline.',
        createdAt: past(1),
        updatedAt: past(1),
      },
    ],
  });

  console.log('✓ Task comments created');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('─────────────────────────────────────────────────────');
  console.log('📧 Development Credentials (DO NOT use in production)');
  console.log('─────────────────────────────────────────────────────');
  console.log('ADMIN:           admin@agencyflow.dev  /  Admin@123');
  console.log('PROJECT MANAGER: priya@agencyflow.dev  /  PM@123456');
  console.log('PROJECT MANAGER: marco@agencyflow.dev  /  PM@123456');
  console.log('DEVELOPER:       amit@agencyflow.dev   /  Dev@123456');
  console.log('DEVELOPER:       sarah@agencyflow.dev  /  Dev@123456');
  console.log('DEVELOPER:       rahul@agencyflow.dev  /  Dev@123456');
  console.log('DEVELOPER:       lisa@agencyflow.dev   /  Dev@123456');
  console.log('─────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
