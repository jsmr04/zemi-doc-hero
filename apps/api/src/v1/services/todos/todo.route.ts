import express from 'express';
import * as todoController from './todo.controller';
import { checkTodoId, checkTodoBody } from './todo.validations';
import { auth } from '../../../middleware/authorization';

const router = express.Router();

//INFO: Add you endpoints here

//INFO: ~ Endpoint Naming Convention ~
// 1) Keep your endpoints lowercased
// 2) When a REST API endpoint has multiple words use hyphen (-) to separate them.
// for example, for a notification endpoint, use send-notification,
// instead of sendNotification or send_notification

//INFO: ~ METHODS ~
// Please use the proper method
// Get -> Fetch items
// Post -> Create a new item
// Delete -> Remove item
// Put -> Update item
// Patch -> Partial update
// Etc.

router.get('/', todoController.getTodos);
router.get('/:id', checkTodoId, todoController.getTodo);
router.post('/add', auth, checkTodoBody, todoController.addTodo);
router.delete('/:id/delete', todoController.deleteTodo);
router.put('/:id/update', todoController.updateTodo);

export default router;
