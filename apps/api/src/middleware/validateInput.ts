import { logger } from '@/plugins/winston';
import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import { generateErrorAPIResponse } from '@/helpers/api';

const validateInpunt = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
  });

  if (!parsed.success) {
    const stringErrorDetails = JSON.stringify(parsed.error.format());
    logger.error(stringErrorDetails);
    return generateErrorAPIResponse(
      res,
      {
        message: 'Invalid input.',
        details: stringErrorDetails,
      },
      'Bad Request',
    );
  }

  req.body = parsed.data.body ?? req.body;
  //eslint-disable-next-line
  req.params = (parsed.data.params ?? req.params) as any;

  next();
};

export default validateInpunt;
