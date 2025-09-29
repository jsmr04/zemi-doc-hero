import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { BUCKET_NAME } from '@/configs';
import { generateErrorAPIResponse } from '@/helpers/api';
import { s3Client } from '@/lib/aws/s3';
import { MulterS3Storage } from '@/lib/multer/s3Storage';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_SIZE_IN_MB = 5;
const FILE_SIZE_LIMIT_BYTES = MAX_SIZE_IN_MB * 1024 * 1024;

const s3Storage = new MulterS3Storage(s3Client, BUCKET_NAME);

/**
 *
 */
export const uploadFileToS3 = multer({
  storage: s3Storage,
  limits: { fileSize: FILE_SIZE_LIMIT_BYTES, files: 1 },
  fileFilter(req, file, callback) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'));
    }
  },
});

/**
 *
 */
export const uploadFileErrorHandler = (err: MulterError, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return generateErrorAPIResponse(
      res,
      { message: `File too large. Max size is ${MAX_SIZE_IN_MB}MB.` },
      'Bad Request',
    );
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    return generateErrorAPIResponse(
      res,
      {
        message: 'Too many files. Only one file allowed.',
      },
      'Bad Request',
    );
  } else if (err.message === 'Unable to upload file.') {
    return generateErrorAPIResponse(res, { message: err.message });
  } else if (err.message.includes('Invalid file type')) {
    return generateErrorAPIResponse(
      res,
      {
        message: err.message,
      },
      'Unsupported Media Type',
    );
  }

  next(err);
};
