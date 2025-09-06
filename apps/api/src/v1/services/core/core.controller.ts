import { Request, Response } from "express";
import * as coreService from "./core.service";
import { logger } from "@/plugins/winston";
import { MergeDocumentsSchema, SplitDocumentSchema, DeletePagesSchema, CompressDocumentSchema } from "./core.schema";

export const mergeDocuments = async (req: Request, res: Response)=>{
    try {
        const parsed = MergeDocumentsSchema.safeParse(req.body)
        if (!parsed.success) return res.status(400).json({ error: "Invalid input.", details: parsed.error.format() })

        const { objects } = parsed.data

        const url = await coreService.mergePdf(objects)
        return res.send({ url })
    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to merge PDFs." })
    }
}

export const splitDocument = async (req: Request, res: Response)=>{
    try {
        const parsed = SplitDocumentSchema.safeParse(req.body)

        if (!parsed.success) return res.status(400).json({ error: "Invalid input.", details: parsed.error.format() });
        const { objectName, ranges } = parsed.data

        const splitDocuments = await coreService.splitPdf(objectName, ranges)
        return res.send(splitDocuments)
    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to split PDF." })
    }
}

export const deletePagesFromDocument = async (req: Request, res: Response)=>{
    try {
        const parsed = SplitDocumentSchema.safeParse(req.body)
        if (!parsed.success) return res.status(400).json({ error: "Invalid input.", details: parsed.error.format() });
        const { objectName, ranges } = parsed.data

        const url = await coreService.deletePagesFromPdf(objectName, ranges)
        return res.send({ url })
    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to delete pages from PDF" })
    }
}

export const compressDocument = async (req: Request, res: Response)=>{
    try {
        const parsed = CompressDocumentSchema.safeParse(req.body)
        if (!parsed.success) return res.status(400).json({ error: "Invalid input.", details: parsed.error.format() });
        const { objectName, quality } = parsed.data

        const url = await coreService.compressPdf(objectName, quality)
        return res.send({ url })
    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to compress PDF" })
    }
}