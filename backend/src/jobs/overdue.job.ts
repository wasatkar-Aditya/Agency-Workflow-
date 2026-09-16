import cron from 'node-cron';
import { prisma } from '../config/database';
import { notificationService } from '../services/notification.service';
import { activityService } from '../services/activity.service';
import { getSocketIO } from '../websocket/socket';
import { logger } from '../config/logger';

const SYSTEM_ACTOR_ID = 'system'; // Used for system-generated activity

/**
 * Overdue Task Scheduler
 *
 * Design: Option A — isOverdue boolean field
 * - Runs every 5 minutes
 * - Finds tasks where dueDate < now AND status != DONE AND isOverdue = false
 * - Sets isOverdue = true (prevents re-processing)
 * - Creates persistent notifications for assignees and project owners
 * - Emits real-time events
 * - Uses UTC consistently
 */
async function processOverdueTasks(): Promise<void> {
  logger.info('[OverdueJob] Starting overdue task check');

  const now = new Date();

  try {
    // Find newly overdue tasks (not yet flagged)
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'DONE' },
        isOverdue: false,
      },
      include: {
        project: {
          select: { id: true, name: true, ownerId: true },
        },
        assignedDeveloper: {
          select: { id: true, name: true },
        },
      },
    });

    if (overdueTasks.length === 0) {
      logger.info('[OverdueJob] No newly overdue tasks found');
      return;
    }

    logger.info(`[OverdueJob] Processing ${overdueTasks.length} overdue task(s)`);

    // Update all in one batch
    await prisma.task.updateMany({
      where: { id: { in: overdueTasks.map((t) => t.id) } },
      data: { isOverdue: true },
    });

    // Create notifications and activity for each
    for (const task of overdueTasks) {
      // Notify assigned developer
      if (task.assignedDeveloper) {
        await notificationService.create({
          userId: task.assignedDeveloper.id,
          type: 'TASK_OVERDUE',
          title: 'Task Overdue',
          message: `"${task.title}" is overdue. Please update its status.`,
          taskId: task.id,
          projectId: task.project.id,
        });
      }

      // Notify project owner (PM)
      await notificationService.create({
        userId: task.project.ownerId,
        type: 'TASK_OVERDUE',
        title: 'Task Overdue',
        message: `"${task.title}" in project "${task.project.name}" is overdue.`,
        taskId: task.id,
        projectId: task.project.id,
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          actorId: task.project.ownerId, // Use PM as actor for system events
          projectId: task.project.id,
          taskId: task.id,
          eventType: 'task.overdue',
          message: `Task "${task.title}" is overdue`,
          metadata: { taskId: task.id, dueDate: task.dueDate?.toISOString() },
        },
      });

      // Real-time broadcast
      try {
        const io = getSocketIO();
        io.to(`project:${task.project.id}`).emit('task.overdue', {
          taskId: task.id,
          title: task.title,
          projectId: task.project.id,
          dueDate: task.dueDate,
        });
      } catch {
        // Socket may not be available
      }
    }

    logger.info(`[OverdueJob] Processed ${overdueTasks.length} overdue task(s)`);
  } catch (error) {
    logger.error('[OverdueJob] Error processing overdue tasks', { error });
  }
}

// Also reset isOverdue for tasks that are now DONE
async function resetCompletedOverdue(): Promise<void> {
  await prisma.task.updateMany({
    where: { status: 'DONE', isOverdue: true },
    data: { isOverdue: false },
  });
}

export function startOverdueScheduler(): void {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await processOverdueTasks();
    await resetCompletedOverdue();
  });

  logger.info('[OverdueJob] Scheduler started — running every 5 minutes');
}

// Manual trigger for admin/testing
export async function triggerOverdueCheck(): Promise<{ processed: number }> {
  const before = await prisma.task.count({ where: { isOverdue: false, status: { not: 'DONE' } } });
  await processOverdueTasks();
  await resetCompletedOverdue();
  const after = await prisma.task.count({ where: { isOverdue: true } });
  return { processed: after };
}
