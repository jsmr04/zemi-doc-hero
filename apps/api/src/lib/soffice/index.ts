import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { logger } from '@/plugins/winston';

type ConvertFile = {
  buffer: Buffer<ArrayBufferLike>;
  inputFileName: string;
  outputFileName: string;
};

const CONVERT_DIR = path.join(__dirname, '../../../../tmp/convert');
const CONVERT_TO_PDF = 'pdf';

const execAsync = promisify(exec);

export const convertFileToPdf = async ({ buffer, inputFileName, outputFileName }: ConvertFile) => {
  const inputDir = `${CONVERT_DIR}/input`;
  const inputFile = path.join(inputDir, inputFileName);
  const outputDir = `${CONVERT_DIR}/output`;
  const outputFile = path.join(outputDir, outputFileName);

  fs.mkdirSync(inputDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(inputFile, buffer);

  const cmd = `soffice --headless --convert-to ${CONVERT_TO_PDF} --outdir "${outputDir}" "${inputFile}"`;
  const { stdout } = await execAsync(cmd);
  logger.info(stdout);

  const outputBuffer = fs.readFileSync(outputFile);

  // Clean up
  fs.unlinkSync(inputFile);
  fs.unlinkSync(outputFile);

  return outputBuffer;
};
