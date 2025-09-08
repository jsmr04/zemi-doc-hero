import express from 'express';
import { ValidateInput } from '@/middleware';
import * as coreController from './core.controller';
import { MergeDocumentsSchema, SplitDocumentSchema, DeletePagesSchema, CompressDocumentSchema } from './core.schema';

const router = express.Router();

router.post('/pdf/merge', ValidateInput(MergeDocumentsSchema), coreController.mergeDocuments);
router.post('/pdf/split', ValidateInput(SplitDocumentSchema), coreController.splitDocument);
router.post('/pdf/delete-pages', ValidateInput(DeletePagesSchema), coreController.deletePagesFromDocument);
router.post('/pdf/compress', ValidateInput(CompressDocumentSchema), coreController.compressDocument);

export default router;
