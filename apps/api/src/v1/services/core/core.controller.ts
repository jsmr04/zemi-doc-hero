import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib"
import * as coreService from "./core.service";
import { logger } from "@/plugins/winston";

export const mergeDocuments = async (req: Request, res: Response)=>{
    let mergedDocument: Uint8Array<ArrayBufferLike>
    try {
        const documents = req.files as Express.Multer.File[];
        if (!documents || documents.length < 0) return res.status(400).json({ error: "Please upload at least 2 PDFs" });
        
        mergedDocument = await coreService.mergeDocuments(documents)
        
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=merged.pdf")
        return res.send(Buffer.from(mergedDocument))

    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to merge PDFs" })
    }
}

export const splitDocument = async (req: Request, res: Response)=>{
    try {
        const document = req.file as Express.Multer.File;
        const rawData = req.body?.data
        
        if (!rawData) return res.status(400).json({ error: "Please provide the ranges" });

        const data = JSON.parse(rawData)
        const ranges = data?.ranges as number[][]

        if (!ranges || ranges.length === 0) return res.status(400).json({ error: "Please provide the ranges" });

        if (!document) return res.status(400).json({ error: "Please upload a PDF" });

        const splitDocuments = await coreService.splitDocument(document, ranges)
       
        return res.send(splitDocuments)

    } catch (error) {
        logger.error(error)
        res.status(500).send({ error: "Failed to split PDF" })
    }
}
