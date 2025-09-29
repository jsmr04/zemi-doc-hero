import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { BUCKET_NAME } from '@/configs';
import { generateErrorAPIResponse } from '@/helpers/api';
import { s3Client } from '@/lib/aws/s3';
import { MulterS3Storage } from '@/lib/multer/s3Storage';

const MAX_SIZE_IN_MB = 5;
const FILE_SIZE_LIMIT_BYTES = MAX_SIZE_IN_MB * 1024 * 1024;

const s3Storage = new MulterS3Storage(s3Client, BUCKET_NAME);

/**
 *
 */
export const uploadFileToS3 = multer({ storage: s3Storage, limits: { fileSize: FILE_SIZE_LIMIT_BYTES } });

/**
 *
 */
export const uploadFileErrorHandler = (err: MulterError, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return generateErrorAPIResponse(res, { message: `File too large. Max size is ${MAX_SIZE_IN_MB}MB.` });
  } else if (err.message === 'Unable to upload file.') {
    return generateErrorAPIResponse(res, { message: err.message });
  }

  next(err);
};
