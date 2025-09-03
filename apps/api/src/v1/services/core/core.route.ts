import express from "express";
import multer from "multer";
import * as coreController from "./core.controller";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() })

router.post("/pdf/merge", coreController.mergeDocuments)
router.post("/pdf/split", upload.single('file'), coreController.splitDocument)
router.post("/pdf/delete-pages", upload.single('file'), coreController.deletePagesFromDocument)
router.post("/pdf/compress", upload.single('file'), coreController.compressDocument)

export default router