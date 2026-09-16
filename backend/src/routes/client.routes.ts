import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticateUser, requireAdminOrPM } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', requireAdminOrPM, clientController.getAll.bind(clientController));
router.post('/', requireAdminOrPM, clientController.create.bind(clientController));
router.get('/:id', requireAdminOrPM, clientController.getById.bind(clientController));
router.patch('/:id', requireAdminOrPM, clientController.update.bind(clientController));
router.delete('/:id', requireAdminOrPM, clientController.delete.bind(clientController));

export default router;
