import express from 'express';
import { uploadFileToS3, uploadFileErrorHandler } from '@/middleware/fileUploader';
import * as fileController from './file.controller';

const router = express.Router();

router.post('/upload', uploadFileToS3.single('file'), uploadFileErrorHandler, fileController.upload);

export default router;
