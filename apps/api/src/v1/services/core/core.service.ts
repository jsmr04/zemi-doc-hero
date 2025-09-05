import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { exec } from "child_process";
import { PDFDocument } from "pdf-lib"
import { getObject, putObject, streamToBuffer, presignUrlFromExistingObject } from "@/lib/aws/s3";
import { logger } from "@/plugins/winston";
import { FileQuality } from "./core.schema";


const execAsync = promisify(exec);

const QUALITY_CONFIG: Record<FileQuality, string> = {
    "low": "/screen",
    "good-for-ebooks": "/ebook",
    "good": "/printer",
    "high": "/prepress"
}

export const mergePdf = async (documentIds: string[]) => {
    const mergedPdf = await PDFDocument.create()

    for (let documentId of documentIds) {
        const stream = await getObject({
            objectPrefix: 'upload',
            objectName: documentId
        })

        const document = await streamToBuffer(stream)
        if (!document) throw new Error('Document not found')

        const loadedDocument = await PDFDocument.load(document)
        const copiedPages = await mergedPdf.copyPages(loadedDocument, loadedDocument.getPageIndices())
        copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedDocument = await mergedPdf.save()

    const mergedDocumentId = `${uuidv4() + '.pdf'}`
    await putObject({
        objectPrefix: 'download',
        objectName: mergedDocumentId,
        body: mergedDocument.buffer as any
    })

    const presignedUrl = await presignUrlFromExistingObject({
        objectPrefix: 'download',
        objectName: mergedDocumentId,
    })

    return presignedUrl
}

export const splitPdf = async (document: Express.Multer.File, ranges: number[][]) => {
    let splitDocuments: Uint8Array<ArrayBufferLike>[] = []
    const loadedDocument = await PDFDocument.load(document.buffer)

    for (const [start, end] of ranges) {
        const newPdf = await PDFDocument.create()

        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => i + start)

        const copiedPages = await newPdf.copyPages(loadedDocument, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfFile = await newPdf.save()
        splitDocuments.push(pdfFile)
    }

    return splitDocuments
}

export const deletePagesFromPdf = async (document: Express.Multer.File, ranges: number[][]) => {
    const loadedDocument = await PDFDocument.load(document.buffer)
    const pageCount = loadedDocument.getPageCount()

    let pagesToKeep: number[] = []

    for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
        let isDelete = false
        for (const [start, end] of ranges) {
            if (pageNumber >= start && pageNumber <= end) {
                isDelete = true
            }
        }

        if (!isDelete) {
            pagesToKeep.push(pageNumber)
        }
    }

    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(loadedDocument, pagesToKeep);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfFile = await newPdf.save()

    return pdfFile
}

export const compressPdf = async (document: Express.Multer.File, quality: FileQuality) => {
    const pdfSettings = QUALITY_CONFIG[quality]

    if (!QUALITY_CONFIG[quality]) throw new Error("Invalid quality value.")

    const dirPath = path.join(__dirname, '../../../../tmp/compress')
    const inputPath = path.join(dirPath, `input-${Date.now()}.pdf`)
    const outputPath = path.join(dirPath, `output-${Date.now()}.pdf`)

    fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(inputPath, document.buffer)

    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSettings} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    await execAsync(cmd);
    logger.info(`Compressed PDF saved to ${outputPath}`);

    // Remove input file
    fs.unlinkSync(inputPath)

    const compressedFile = fs.readFileSync(outputPath)

    return compressedFile
}