import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { taskController } from '../controllers/task.controller';
import { authenticateUser, requireAdminOrPM } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', requireAdminOrPM, projectController.getAll.bind(projectController));
router.post('/', requireAdminOrPM, projectController.create.bind(projectController));
router.get('/:id', requireAdminOrPM, projectController.getById.bind(projectController));
router.patch('/:id', requireAdminOrPM, projectController.update.bind(projectController));
router.delete('/:id', requireAdminOrPM, projectController.delete.bind(projectController));
router.get('/:id/activity', requireAdminOrPM, projectController.getActivity.bind(projectController));
router.get('/:id/analytics', requireAdminOrPM, projectController.getAnalytics.bind(projectController));
router.get('/:id/tasks', taskController.getProjectTasks.bind(taskController));

export default router;
