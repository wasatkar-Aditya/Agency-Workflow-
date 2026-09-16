import { Router } from 'express';
import {
  activityController,
  notificationController,
  adminController,
} from '../controllers/misc.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Activity
router.get('/activity', authenticateUser, activityController.getAll.bind(activityController));
router.get('/activity/missed', authenticateUser, activityController.getMissed.bind(activityController));

// Notifications
router.get('/notifications', authenticateUser, notificationController.getAll.bind(notificationController));
router.get('/notifications/unread-count', authenticateUser, notificationController.getUnreadCount.bind(notificationController));
router.patch('/notifications/read-all', authenticateUser, notificationController.markAllRead.bind(notificationController));
router.patch('/notifications/:id/read', authenticateUser, notificationController.markRead.bind(notificationController));

// Admin
router.post('/admin/jobs/overdue', authenticateUser, requireAdmin, adminController.triggerOverdueJob.bind(adminController));
router.get('/admin/online-users', authenticateUser, requireAdmin, adminController.getOnlineUsers.bind(adminController));
router.get('/admin/dashboard-stats', authenticateUser, requireAdmin, adminController.getDashboardStats.bind(adminController));

export default router;
