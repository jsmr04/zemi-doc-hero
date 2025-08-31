import { PDFDocument } from "pdf-lib"

export const mergeDocuments = async (documents: Express.Multer.File[]) => {
    const mergedPdf = await PDFDocument.create()

    for (let document of documents) {
        const loadedDocument = await PDFDocument.load(document.buffer)
        const copiedPages = await mergedPdf.copyPages(loadedDocument, loadedDocument.getPageIndices())
        copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedDocument = await mergedPdf.save()
    return mergedDocument
}

export const splitDocument = async (document: Express.Multer.File, ranges: number[][]) => {
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