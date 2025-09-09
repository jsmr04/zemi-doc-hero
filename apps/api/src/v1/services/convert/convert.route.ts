import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';
import { PDFDocument } from 'pdf-lib';
import { z } from 'zod';
import * as s3 from '@/lib/aws/s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '@/plugins/winston';
// import {  } from 'file-type';
// import {  } from "../../../../tmp";

const execAsync = promisify(exec);

const detectFileType = async (buffer: Uint8Array | ArrayBuffer) => {
  const { fileTypeFromBuffer } = await import('file-type');
  return await fileTypeFromBuffer(buffer);
};

//eslint-disable-next-line
const ConvertSchema = z.object({
  body: z
    .object({
      objectName: z.string().nonempty({ error: 'Please provide the document (object).' }),
      from: z.enum(['jpg', 'png', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls']),
      to: z.enum(['pdf']),
    })
    .strict(),
});

type Convert = z.infer<typeof ConvertSchema>;

const router = express.Router();

router.post('/', async (req: Request<unknown, unknown, Convert['body']>, res: Response) => {
  const { objectName, from, to } = req.body;
  let presignedUrl = '';

  try {
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
      const pdfFile = await newPdf.save();
      const documentId = `${uuidv4() + '.pdf'}`;
      await s3.putObject({
        objectPrefix: 'download',
        objectName: documentId,
        body: pdfFile.buffer as unknown as StreamingBlobPayloadInputTypes,
      });

      presignedUrl = await s3.presignUrlFromExistingObject({
        objectPrefix: 'download',
        objectName: documentId,
      });
    } else {
      //TODO:
      const inputFileType = await detectFileType(fileBuffer);
      if (!inputFileType) return res.status(400).send({ error: 'Unable to determine the input file type.' });

      const fileName = `${Date.now()}.${inputFileType.ext}`;
      const CONVERT_DIR = path.join(__dirname, '../../../../tmp/convert');
      const inputDir = `${CONVERT_DIR}/input`;
      const inputFile = path.join(inputDir, fileName);
      const outputDir = `${CONVERT_DIR}/output`;
      const outputFile = path.join(outputDir, fileName);

      fs.mkdirSync(inputDir, { recursive: true });
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(inputFile, fileBuffer);

      const cmd = `soffice --headless --convert-to ${to} --outdir "${outputDir}" "${inputFile}"`;
      logger.info(cmd);
      const { stdout } = await execAsync(cmd);
      logger.info(stdout);

      const convertedDocument = fs.readFileSync(outputFile);
      const outputFileType = await detectFileType(convertedDocument);
      if (!outputFileType) return res.status(400).send({ error: 'Unable to determine the output file type.' });

      const documentId = `${uuidv4()}.pdf`;
      await s3.putObject({
        objectPrefix: 'download',
        objectName: documentId,
        body: convertedDocument.buffer as unknown as StreamingBlobPayloadInputTypes,
      });

      presignedUrl = await s3.presignUrlFromExistingObject({
        objectPrefix: 'download',
        objectName: documentId,
      });

      // Clean up
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);
    }

    return res.send({ url: presignedUrl });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ error });
  }
});

export default router;
