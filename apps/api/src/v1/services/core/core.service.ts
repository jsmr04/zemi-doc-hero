import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { exec } from "child_process";
import { PDFDocument } from "pdf-lib"
import { getObjectAndConvertToBuffer, putObject, presignUrlFromExistingObject } from "@/lib/aws/s3";
import { logger } from "@/plugins/winston";
import { FileQuality } from "./core.schema";

const execAsync = promisify(exec);

type SplitResponse = {
    objectName: string
    url: string
}

const QUALITY_CONFIG: Record<FileQuality, string> = {
    "low": "/screen",
    "good-for-ebooks": "/ebook",
    "good": "/printer",
    "high": "/prepress"
}

export const mergePdf = async (objects: string[]) => {
    const mergedPdf = await PDFDocument.create()

    for (let objectName of objects) {
        const document = await getObjectAndConvertToBuffer({
            objectPrefix: 'upload',
            objectName
        })

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

export const splitPdf = async (objectName: string, ranges: number[][]) => {
    let splitDocuments: SplitResponse[] = []
    const document = await getObjectAndConvertToBuffer({
        objectPrefix: 'upload',
        objectName
    })

    const loadedDocument = await PDFDocument.load(document)

    for (const [start, end] of ranges) {
        const newPdf = await PDFDocument.create()

        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => i + start)

        const copiedPages = await newPdf.copyPages(loadedDocument, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const mergedDocumentId = `${uuidv4() + '.pdf'}`
        const pdfFile = await newPdf.save()

        await putObject({
            objectPrefix: 'download',
            objectName: mergedDocumentId,
            body: pdfFile.buffer as any
        })

        const presignedUrl = await presignUrlFromExistingObject({
            objectPrefix: 'download',
            objectName: mergedDocumentId,
        })

        splitDocuments.push({ objectName: mergedDocumentId, url: presignedUrl })
    }

    return splitDocuments
}

export const deletePagesFromPdf = async (objectName: string, ranges: number[][]) => {
    const document = await getObjectAndConvertToBuffer({
        objectPrefix: 'upload',
        objectName
    })

    const loadedDocument = await PDFDocument.load(document)
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

    const documentId = `${uuidv4() + '.pdf'}`
    await putObject({
        objectPrefix: 'download',
        objectName: documentId,
        body: pdfFile.buffer as any
    })

    const presignedUrl = await presignUrlFromExistingObject({
        objectPrefix: 'download',
        objectName: documentId,
    })

    return presignedUrl
}

export const compressPdf = async (objectName: string, quality: FileQuality) => {
    const pdfSettings = QUALITY_CONFIG[quality]

    if (!QUALITY_CONFIG[quality]) throw new Error("Invalid quality value.")

    const document = await getObjectAndConvertToBuffer({
        objectPrefix: 'upload',
        objectName
    })

    const dirPath = path.join(__dirname, '../../../../tmp/compress')
    const inputPath = path.join(dirPath, `input-${Date.now()}.pdf`)
    const outputPath = path.join(dirPath, `output-${Date.now()}.pdf`)

    fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(inputPath, document)

    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSettings} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    await execAsync(cmd);
    logger.info(`Compressed PDF saved to ${outputPath}`);

    const pdfFile = fs.readFileSync(outputPath)

    const documentId = `${uuidv4() + '.pdf'}`
    await putObject({
        objectPrefix: 'download',
        objectName: documentId,
        body: pdfFile.buffer as any
    })

    const presignedUrl = await presignUrlFromExistingObject({
        objectPrefix: 'download',
        objectName: documentId,
    })

    // Clean up
    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)

    return presignedUrl
}