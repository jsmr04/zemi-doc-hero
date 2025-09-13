import { Request, Response } from 'express';
import { logger } from '@/plugins/winston';
import { generateSuccessfulAPIResponse, generateErrorAPIResponse } from '@/helpers/api';
import { Convert, GenericConvertResponseData } from './convert.schema';
import * as convertService from './convert.service';

export const convert = async (req: Request<unknown, unknown, Convert['body']>, res: Response) => {
  const { objectName, from } = req.body;

  try {
    const url = await convertService.convertFile(objectName, from);
    return generateSuccessfulAPIResponse<GenericConvertResponseData>(res, { url });
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to convert file.' });
  }
};
