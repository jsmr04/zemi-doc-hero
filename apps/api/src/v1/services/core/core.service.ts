import { logger } from "@/plugins/winston";
import fs from "fs";
import { join } from "path";
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

// TODO:
// Document: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
// Delete: 4 - 6, 1 - 2, 9 - 9
// Output: 3, 7, 8, 10 
export const deletePages = async (document: Express.Multer.File, ranges: number[][]) => {
// export const deletePages = async () => {    
    // const ranges = [[0,4], [15,15], [21, 27], [29, 29]]
    // const ranges = [[28, 29]]
    //5 + 1 + 8 + 1
    // let splitDocuments: Uint8Array<ArrayBufferLike>[] = []
    const loadedDocument = await PDFDocument.load(document.buffer)
    // const loadedDocument = await PDFDocument.load(fs.readFileSync("../../../mocks/files/file-example_PDF_1MB.pdf"))
    // const pdfPath = join(__dirname, "../../../mocks/files/file-example_PDF_1MB.pdf");
    // logger.info(`pdfPath ${pdfPath}`)
    // const loadedDocument = await PDFDocument.load(fs.readFileSync(pdfPath))
    const pageCount = loadedDocument.getPageCount()
    console.log(`pageCount: ${pageCount}`)
    // let pagesToKeep: number[] = Array.from({ length: pageCount - 1 }, (_, i) => i )
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

    // console.log(`pagesToKeep ${pagesToKeep}`)

    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(loadedDocument, pagesToKeep);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfFile = await newPdf.save()
    // const pdfExportPath = join(__dirname, "../../../../exports/delete_pages.pdf");
    // fs.writeFileSync(pdfExportPath, pdfFile);

    // for (const [start, end] of ranges) {
    //     for (let i = start; i < end; i ++ ){
    //         // pagesToKeep = pagesToKeep.splice()
    //     }
    // }

    // for (const [start, end] of ranges) {
    //     const newPdf = await PDFDocument.create()

    //     const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => i + start)

    //     const copiedPages = await newPdf.copyPages(loadedDocument, pageIndices);
    //     copiedPages.forEach((page) => newPdf.addPage(page));

    //     const pdfFile = await newPdf.save()
    //     splitDocuments.push(pdfFile)
    // }

    return pdfFile
}