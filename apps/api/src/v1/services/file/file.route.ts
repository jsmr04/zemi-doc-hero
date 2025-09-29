import express from 'express';
import { uploadFileToS3 } from '@/middleware/fileUploader';
import * as fileController from './file.controller';

const router = express.Router();

router.post('/upload', uploadFileToS3.single('file'), fileController.upload);

export default router;
