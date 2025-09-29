import { Request, Response } from 'express';
import { generateSuccessfulAPIResponse, generateErrorAPIResponse } from '@/helpers/api';
import { logger } from '@/plugins/winston';
import { FileUploadResponse } from './file.schema';
import type { MulterS3File } from '@/lib/multer/s3Storage';

export const upload = async (req: Request, res: Response) => {
  const document = req.file as MulterS3File;
  if (!document) return generateErrorAPIResponse(res, { message: 'Please upload a file.' }, 'Bad Request');

  try {
    const response: FileUploadResponse = {
      objectName: document.key,
      fileName: document.originalname,
    };
    return generateSuccessfulAPIResponse<FileUploadResponse>(res, response);
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to upload file.' });
  }
};
