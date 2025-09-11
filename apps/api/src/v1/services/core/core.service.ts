import { v4 as uuidv4 } from 'uuid';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';
import { PDFDocument } from 'pdf-lib';
import * as s3 from '@/lib/aws/s3';
import * as ghostscript from '@/lib/ghostscript';
import { FileQuality } from './core.schema';

type SplitResponse = {
  objectName: string;
  url: string;
};

const QUALITY_CONFIG: Record<FileQuality, ghostscript.CompressQuality> = {
  low: '/screen',
  'good-for-ebooks': '/ebook',
  good: '/printer',
  high: '/prepress',
};

export const mergePdf = async (objects: string[]) => {
  const mergedPdf = await PDFDocument.create();

  for (let objectName of objects) {
    const document = await s3.getObjectAndConvertToBuffer({
      objectPrefix: 'upload',
      objectName,
    });

    const loadedDocument = await PDFDocument.load(document);
    const copiedPages = await mergedPdf.copyPages(loadedDocument, loadedDocument.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedDocument = await mergedPdf.save();

  const mergedDocumentId = `${uuidv4() + '.pdf'}`;
  await s3.putObject({
    objectPrefix: 'download',
    objectName: mergedDocumentId,
    body: mergedDocument.buffer as unknown as StreamingBlobPayloadInputTypes,
  });

  const presignedUrl = await s3.presignUrlFromExistingObject({
    objectPrefix: 'download',
    objectName: mergedDocumentId,
  });

  return presignedUrl;
};

export const splitPdf = async (objectName: string, ranges: number[][]) => {
  let splitDocuments: SplitResponse[] = [];
  const document = await s3.getObjectAndConvertToBuffer({
    objectPrefix: 'upload',
    objectName,
  });

  const loadedDocument = await PDFDocument.load(document);

  for (const [start, end] of ranges) {
    const newPdf = await PDFDocument.create();

    const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => i + start);

    const copiedPages = await newPdf.copyPages(loadedDocument, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const mergedDocumentId = `${uuidv4() + '.pdf'}`;
    const pdfFile = await newPdf.save();

    await s3.putObject({
      objectPrefix: 'download',
      objectName: mergedDocumentId,
      body: pdfFile.buffer as unknown as StreamingBlobPayloadInputTypes,
    });

    const presignedUrl = await s3.presignUrlFromExistingObject({
      objectPrefix: 'download',
      objectName: mergedDocumentId,
    });

    splitDocuments.push({ objectName: mergedDocumentId, url: presignedUrl });
  }

  return splitDocuments;
};

export const deletePagesFromPdf = async (objectName: string, ranges: number[][]) => {
  const document = await s3.getObjectAndConvertToBuffer({
    objectPrefix: 'upload',
    objectName,
  });

  const loadedDocument = await PDFDocument.load(document);
  const pageCount = loadedDocument.getPageCount();

  let pagesToKeep: number[] = [];

  for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
    let isDelete = false;
    for (const [start, end] of ranges) {
      if (pageNumber >= start && pageNumber <= end) {
        isDelete = true;
      }
    }

    if (!isDelete) {
      pagesToKeep.push(pageNumber);
    }
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(loadedDocument, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const pdfFile = await newPdf.save();

  const documentId = `${uuidv4() + '.pdf'}`;
  await s3.putObject({
    objectPrefix: 'download',
    objectName: documentId,
    body: pdfFile.buffer as unknown as StreamingBlobPayloadInputTypes,
  });

  const presignedUrl = await s3.presignUrlFromExistingObject({
    objectPrefix: 'download',
    objectName: documentId,
  });

  return presignedUrl;
};

export const compressPdf = async (objectName: string, quality: FileQuality) => {
  const compressQuality = QUALITY_CONFIG[quality];
  const outputObjectName = `${uuidv4() + '.pdf'}`;

  if (!QUALITY_CONFIG[quality]) throw new Error('Invalid quality value.');

  const document = await s3.getObjectAndConvertToBuffer({
    objectPrefix: 'upload',
    objectName,
  });

  const compressedDocument = await ghostscript.compress({
    fileType: 'PDF',
    quality: compressQuality,
    buffer: document,
    inputFileName: objectName,
    outputFileName: outputObjectName,
  });

  await s3.putObject({
    objectPrefix: 'download',
    objectName: outputObjectName,
    body: compressedDocument.buffer as unknown as StreamingBlobPayloadInputTypes,
  });

  const presignedUrl = await s3.presignUrlFromExistingObject({
    objectPrefix: 'download',
    objectName: outputObjectName,
  });

  return presignedUrl;
};
