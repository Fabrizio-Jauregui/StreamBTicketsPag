import { Router } from 'express';
import * as controller from '../controllers/ticketController.js';

const router = Router();
router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id/status', controller.setStatus);
router.patch('/:id/assignee', controller.setAssignee);
router.post('/:id/suggested-reply', controller.suggest);
export default router;
