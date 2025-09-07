import { Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { GetTodoByIdDTO, GetTodoById } from './todo.dto';
import * as todoService from './todo.service';
import { Todo } from './todo.types';
import { logger } from '../../../plugins/winston';
//INFO: Controller gets the request from the route, it validates parameters,
//calls the service, casts values, and finally returns http code and response

export const getTodos = (req: Request, res: Response<Todo[] | string>) => {
  const todos = todoService.getTodos();

  if (todos.length === 0) {
    //Use logger instead of console.log
    logger.warn('Data not found');
    res.status(400).send('Data not found');
  } else {
    res.send(todos);
  }
};

export const getTodo = (
  req: Request<GetTodoById>,
  res: Response<Todo | any>,
) => {
  // const validationErrors = validationResult(req).array()
  const validationResults = GetTodoByIdDTO.safeParse(req.params);
  if (!validationResults.success) {
    res.status(400).json(validationResults.error.format());
  }
  // if (validationErrors.length > 0) return res.status(400).send(validationErrors[0])

  try {
    res.send(todoService.getTodo(req.params.id));
  } catch (error) {
    logger.error(error);
    res.sendStatus(400);
  }
};

export const addTodo = (
  req: Request<Record<string, any> | undefined, null, Todo>,
  res: Response<Todo | ValidationError>,
) => {
  const validationErrors = validationResult(req).array();
  if (validationErrors.length > 0)
    return res.status(400).send(validationErrors[0]);

  try {
    return res.send(todoService.addTodo(req.body));
  } catch (error) {
    logger.error(error);
    res.sendStatus(400);
  }
};

export const deleteTodo = (req: Request<{ id: number }>, res: Response) => {
  try {
    const id = Number(req.params.id);
    res.send(todoService.deleteTodo(id));
  } catch (error) {
    logger.error(error);
    res.sendStatus(400);
  }
};

export const updateTodo = (
  req: Request<{ id: number }, null, Todo>,
  res: Response<Todo>,
) => {
  try {
    const id = Number(req.params.id);
    res.send(todoService.updateTodo(id, req.body));
  } catch (error) {
    logger.error(error);
    res.sendStatus(400);
  }
};
