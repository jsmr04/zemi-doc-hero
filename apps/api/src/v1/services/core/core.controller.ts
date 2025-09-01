import { Request, Response } from "express";
import * as coreService from "./core.service";
import { logger } from "@/plugins/winston";
import { SplitDocumentSchema } from "./core.schema";

export const mergeDocuments = async (req: Request, res: Response)=>{
    let mergedDocument: Uint8Array<ArrayBufferLike>
    try {
        const documents = req.files as Express.Multer.File[];
        if (!documents || documents.length < 0) return res.status(400).json({ error: "Please upload at least 2 PDFs." });
        
        mergedDocument = await coreService.mergePdf(documents)
        
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=merged.pdf")
        return res.send(Buffer.from(mergedDocument))

    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to merge PDFs." })
    }
}

export const splitDocument = async (req: Request, res: Response)=>{
    try {
        const document = req.file as Express.Multer.File;
        if (!document) return res.status(400).json({ error: "Please upload a PDF." });

        const rawData = req.body?.data        
        if (!rawData) return res.status(400).json({ error: "Please provide the ranges." });

        const parsed = SplitDocumentSchema.safeParse(JSON.parse(rawData))

        if (!parsed.success) return res.status(400).json({ error: "Invalid ranges", details: parsed.error.format() });
        const { ranges } = parsed.data

        // const data = JSON.parse(rawData)
        // const ranges = data?.ranges as number[][]

        // if (!ranges || ranges.length === 0) return res.status(400).json({ error: "Please provide the ranges." });
        
        // const isRangeValid = ranges.every((ranges: number[]) => ranges[0] <= ranges[1])
        // if (!isRangeValid) return res.status(400).json({ error: "Please provide a valid range." });

        const splitDocuments = await coreService.splitPdf(document, ranges)
       
        return res.send(splitDocuments)

    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to split PDF." })
    }
}

export const deletePagesFromDocument = async (req: Request, res: Response)=>{
    try {
        const document = req.file as Express.Multer.File;
        const rawData = req.body?.data
        
        if (!rawData) return res.status(400).json({ error: "Please provide the ranges." });

        const data = JSON.parse(rawData)
        const ranges = data?.ranges as number[][]

        if (!ranges || ranges.length === 0) return res.status(400).json({ error: "Please provide the ranges." });

        const isRangeValid = ranges.every((ranges: number[]) => ranges[0] <= ranges[1])
        if (!isRangeValid) return res.status(400).json({ error: "Please provide a valid range." });

        if (!document) return res.status(400).json({ error: "Please upload a PDF." });

        const deletedPagesDocument = await coreService.deletePagesFromPdf(document, ranges)
       
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=deleted_pages_document.pdf")

        return res.send(deletedPagesDocument)

    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to delete pages from PDF" })
    }
}

export const compressDocument = async (req: Request, res: Response)=>{
    try {
        const document = req.file as Express.Multer.File;
        const rawData = req.body?.data

        if (!rawData) return res.status(400).json({ error: "Please provide the quality." });

        const data = JSON.parse(rawData)
        const quality = data?.quality as string

        if (!quality) return res.status(400).json({ error: "Please provide a valid quality." });

        const compressedFile = await coreService.compressPdf(document, quality)

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename=compressed_${quality}_document.pdf`)
        return res.send(compressedFile)

    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to compress PDF" })
    }
}