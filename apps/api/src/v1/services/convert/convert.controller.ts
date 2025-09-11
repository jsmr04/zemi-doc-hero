import { Request, Response } from 'express';
import { Convert } from './convert.schema';
import * as convertService from './convert.service';
import { logger } from '@/plugins/winston';

export const convert = async (req: Request<unknown, unknown, Convert['body']>, res: Response) => {
  const { objectName, from, to } = req.body;

  try {
    const presignedUrl = await convertService.convertFile(objectName, from, to);
    return res.send({ url: presignedUrl });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ error });
  }
};
