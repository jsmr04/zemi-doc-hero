import { v4 as uuidv4 } from 'uuid';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';
import { PDFDocument } from 'pdf-lib';
import * as s3 from '@/lib/aws/s3';
import * as soffice from '@/lib/soffice';
import { ConvertFrom, ConvertTo } from './convert.schema';

export const convertFile = async (objectName: string, from: ConvertFrom, to: ConvertTo) => {
  const documentId = `${uuidv4()}.pdf`;
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
    convertedFileBuffer = await soffice.convertFileToPdf({ buffer: fileBuffer });
  }
  await s3.putObject({
    objectPrefix: 'download',
    objectName: documentId,
    body: convertedFileBuffer as unknown as StreamingBlobPayloadInputTypes,
  });

  presignedUrl = await s3.presignUrlFromExistingObject({
    objectPrefix: 'download',
    objectName: documentId,
  });

  return presignedUrl;
};
