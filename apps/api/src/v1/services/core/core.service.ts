import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import { PDFDocument } from "pdf-lib"
import { logger } from "@/plugins/winston";
import { FileQuality } from "./core.schema";
import { AWS_REGION, AWS_CUSTOM_PROFILE, BUCKET_NAME } from "@/configs";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';

const s3Client = new S3Client({
    region: AWS_REGION,
    profile: AWS_CUSTOM_PROFILE ? AWS_CUSTOM_PROFILE : undefined
})

const execAsync = promisify(exec);

const QUALITY_CONFIG: Record<FileQuality, string> = {
    "low": "/screen",
    "good-for-ebooks": "/ebook",
    "good": "/printer",
    "high": "/prepress"
}

const readObject = async (documentId: string) => {
    const objectName = `upload/${documentId}`
    const { Body } = await s3Client.send(
        new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectName,
        }),
    );

    if (!Body || !(Body instanceof Readable)) {
        throw new Error(`S3 object ${objectName} is not a readable stream`);
    }

    return streamToBuffer(Body as Readable);
}

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
};

// export const mergePdf = async (documents: Express.Multer.File[]) => {
export const mergePdf = async (documentIds: string[]) => {
    const mergedPdf = await PDFDocument.create()

    for (let documentId of documentIds) {
        const document = await readObject(documentId)
        if (!document) throw new Error('Document not found')
            
        const loadedDocument = await PDFDocument.load(document)
        const copiedPages = await mergedPdf.copyPages(loadedDocument, loadedDocument.getPageIndices())
        copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedDocument = await mergedPdf.save()
    return mergedDocument
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

    for (let pageNumber = 0; pageNumber < pageCount; pageNumber++  ){
        let isDelete = false
        for (const [start, end] of ranges){
            if (pageNumber >= start && pageNumber <= end ){
                isDelete = true
            }
        }

        if (!isDelete){
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