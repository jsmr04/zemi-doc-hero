import express from "express";
import multer from "multer";
import * as coreController from "./core.controller";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() })

router.post("/merge", upload.array('file', 10), coreController.mergeDocuments)
router.post("/split", upload.single('file'), coreController.splitDocument)

export default router