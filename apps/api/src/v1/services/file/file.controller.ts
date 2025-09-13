import { Request, Response } from 'express';
import { generateSuccessfulAPIResponse, generateErrorAPIResponse } from '@/helpers/api';
import { logger } from '@/plugins/winston';
import * as fileService from './file.service';
import { FileUploadResponse } from './file.schema';

export const uploadFile = async (req: Request, res: Response) => {
  const document = req.file as Express.Multer.File;
  if (!document) return generateErrorAPIResponse(res, { message: 'Please upload a file.' }, 'Bad Request');

  try {
    const uploadedFile = await fileService.uploadFile(document);
    return generateSuccessfulAPIResponse<FileUploadResponse>(res, uploadedFile);
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to upload file.' });
  }
};
