import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateUser, requireAdmin, requireAdminOrPM } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/developers', requireAdminOrPM, userController.getDevelopers.bind(userController));
router.get('/', requireAdminOrPM, userController.getAll.bind(userController));
router.get('/:id', requireAdminOrPM, userController.getById.bind(userController));

router.use(requireAdmin);

router.post('/', userController.create.bind(userController));
router.patch('/:id', userController.update.bind(userController));
router.patch('/:id/status', userController.setStatus.bind(userController));

export default router;
