import { Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import * as authService from './auth.service';
import { Credentials } from './auth.types';
import { logger } from '../../../plugins/winston';

//INFO: Controller gets the request from the route, it validates parameters,
//calls the service, casts values, and finally returns http code and response

export const login = (
  req: Request<Record<string, any> | undefined, unknown, Credentials>,
  res: Response<{ token: string } | ValidationError>,
) => {
  const validationErrors = validationResult(req).array();
  if (validationErrors.length > 0)
    return res.status(400).send(validationErrors[0]);

  try {
    const token = authService.login(req.body);
    if (!token) return res.sendStatus(401);

    return res.send({ token });
  } catch (error) {
    logger.error(error);
    res.sendStatus(400);
  }
};
