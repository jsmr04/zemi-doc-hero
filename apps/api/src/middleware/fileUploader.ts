import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { BUCKET_NAME } from '@/configs';
import { generateErrorAPIResponse } from '@/helpers/api';
import { s3Client } from '@/lib/aws/s3';
import { MulterS3Storage } from '@/lib/multer/s3Storage';

const MINE_TYPE_PDF = 'application/pdf';
const MINE_TYPE_JPG = 'image/jpeg';
const MINE_TYPE_PNG = 'image/png';
const MINE_TYPE_DOC = 'application/msword';
const MINE_TYPE_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MINE_TYPE_XLS = 'application/vnd.ms-excel';
const MINE_TYPE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MINE_TYPE_PPT = 'application/vnd.ms-powerpoint';
const MINE_TYPE_PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

const ALLOWED_MIME_TYPES = [
  MINE_TYPE_PDF,
  MINE_TYPE_JPG,
  MINE_TYPE_PNG,
  MINE_TYPE_DOC,
  MINE_TYPE_DOCX,
  MINE_TYPE_XLS,
  MINE_TYPE_XLSX,
  MINE_TYPE_PPT,
  MINE_TYPE_PPTX,
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
  const limitSizeErrorResp = { message: `File too large. Max size is ${MAX_SIZE_IN_MB}MB.` };
  if (err.code === 'LIMIT_FILE_SIZE') return generateErrorAPIResponse(res, limitSizeErrorResp, 'Bad Request');

  const limitCountErrorResp = { message: 'Too many files. Only one file allowed.' };
  if (err.code === 'LIMIT_FILE_COUNT') return generateErrorAPIResponse(res, limitCountErrorResp, 'Bad Request');

  const errorResp = { message: err.message };
  if (err.message === 'Unable to upload file.') return generateErrorAPIResponse(res, errorResp);

  const isMediaTypeError = err.message.includes('Invalid file type');
  if (isMediaTypeError) return generateErrorAPIResponse(res, errorResp, 'Unsupported Media Type');

  next(err);
};
