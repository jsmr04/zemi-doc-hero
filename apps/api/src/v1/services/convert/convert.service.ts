import { PDFDocument } from 'pdf-lib';
import * as s3 from '@/lib/aws/s3';
import * as soffice from '@/lib/soffice';
import { ConvertFrom } from './convert.schema';

export const convertFile = async (objectName: string, from: ConvertFrom) => {
  const splitFileName = objectName.split('.');
  if (splitFileName.length === 0) throw new Error('Invalidate object name');
  const convertedDocumentId = `${splitFileName[0]}.pdf`;

  let convertedFileBuffer = null;
  let presignedUrl = '';
  const fileBuffer = await s3.getObjectAndConvertToBuffer({
    objectPrefix: 'upload',
    objectName,
  });

  if (from === 'jpg' || from === 'png') {
    const newPdf = await PDFDocument.create();
    const embedImage =
      from === 'jpg'
        ? (buffer: Uint8Array) => newPdf.embedJpg(buffer)
        : (buffer: Uint8Array) => newPdf.embedPng(buffer);

    const img = await embedImage(fileBuffer);

    const page = newPdf.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
    convertedFileBuffer = await newPdf.save();
  } else {
    convertedFileBuffer = await soffice.convertFileToPdf({
      inputFileName: objectName,
      outputFileName: convertedDocumentId,
      buffer: fileBuffer,
    });
  }
  await s3.putObject({
    objectPrefix: 'download',
    objectName: convertedDocumentId,
    body: convertedFileBuffer as Buffer<ArrayBufferLike>,
  });

  presignedUrl = await s3.presignUrlFromExistingObject({
    objectPrefix: 'download',
    objectName: convertedDocumentId,
  });

  return presignedUrl;
};
