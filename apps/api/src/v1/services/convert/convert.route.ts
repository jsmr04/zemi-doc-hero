import express from 'express';
import * as convertController from './convert.controller';
import { ConvertSchema } from './convert.schema';
import validateInput from '@/middleware/validateInput';

const router = express.Router();

router.post('/', validateInput(ConvertSchema), convertController.convert);

export default router;
