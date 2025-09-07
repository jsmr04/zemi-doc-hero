import express from 'express';
import multer from 'multer';
import * as fileController from './file.controller';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), fileController.uploadFile);

export default router;
