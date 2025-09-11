import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

type FileType = 'PDF';
export type CompressQuality = '/screen' | '/ebook' | '/printer' | '/prepress';
export type CompressParams = {
  fileType: FileType;
  quality: CompressQuality;
  buffer: Buffer<ArrayBufferLike>;
  inputFileName: string;
  outputFileName: string;
};

const FILE_TYPE: Record<FileType, string> = {
  PDF: 'pdfwrite',
};
const COMPRESS_DIR = path.join(__dirname, '../../../../tmp/compress');

const execAsync = promisify(exec);

export const compress = async ({ fileType, quality, buffer, inputFileName, outputFileName }: CompressParams) => {
  const inputDir = `${COMPRESS_DIR}/input`;
  const inputPath = path.join(inputDir, inputFileName);
  const outputDir = `${COMPRESS_DIR}/output`;
  const outputPath = path.join(outputDir, outputFileName);

  fs.mkdirSync(inputDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(inputPath, buffer);

  const cmd = `gs -sDEVICE=${FILE_TYPE[fileType]} -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
  await execAsync(cmd);

  const outputBuffer = fs.readFileSync(outputPath);

  // Clean up
  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputPath);

  return outputBuffer;
};
