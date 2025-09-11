import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { logger } from '@/plugins/winston';

type ConvertFile = {
  buffer: Buffer<ArrayBufferLike>;
};

const CONVERT_DIR = path.join(__dirname, '../../../../tmp/convert');
const CONVERT_TO_PDF = 'pdf';

const execAsync = promisify(exec);

const detectFileType = async (buffer: Uint8Array | ArrayBuffer) => {
  const { fileTypeFromBuffer } = await import('file-type');
  return await fileTypeFromBuffer(buffer);
};

export const convertFileToPdf = async ({ buffer }: ConvertFile) => {
  const inputFileType = await detectFileType(buffer);
  if (!inputFileType) throw new Error('Unable to determine the input file type.');

  const fileName = `${Date.now()}.${inputFileType.ext}`;
  const inputDir = `${CONVERT_DIR}/input`;
  const inputFile = path.join(inputDir, fileName);
  const outputDir = `${CONVERT_DIR}/output`;
  const outputFile = path.join(outputDir, `${Date.now()}.pdf`);

  fs.mkdirSync(inputDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(inputFile, buffer);

  const cmd = `soffice --headless --convert-to ${CONVERT_TO_PDF} --outdir "${outputDir}" "${inputFile}"`;
  logger.info(cmd);
  const { stdout } = await execAsync(cmd);
  logger.info(stdout);

  const outputBuffer = fs.readFileSync(outputFile);

  // Clean up
  fs.unlinkSync(inputFile);
  fs.unlinkSync(outputFile);

  return outputBuffer;
};
