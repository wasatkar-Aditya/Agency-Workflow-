import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateUser, requireAdminOrPM } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// All authenticated users can GET tasks (scoped by role in service)
router.get('/', taskController.getAll.bind(taskController));
router.get('/:id/comments', taskController.getComments.bind(taskController));
router.post('/:id/comments', taskController.addComment.bind(taskController));
router.get('/:id', taskController.getById.bind(taskController));

// Only Admin/PM can create/update/delete tasks
router.post('/', requireAdminOrPM, taskController.create.bind(taskController));
router.patch('/:id', requireAdminOrPM, taskController.update.bind(taskController));
router.delete('/:id', requireAdminOrPM, taskController.delete.bind(taskController));

// Status update — developers can update their own task status (service enforces ownership)
router.patch('/:id/status', taskController.updateStatus.bind(taskController));

// Assign — only PM/Admin
router.patch('/:id/assign', requireAdminOrPM, taskController.assign.bind(taskController));

export default router;
