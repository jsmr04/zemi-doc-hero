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
};

const FILE_TYPE: Record<FileType, string> = {
  PDF: 'pdfwrite',
};
const COMPRESS_DIR = path.join(__dirname, '../../../../tmp/compress');

const execAsync = promisify(exec);

export const compress = async ({
  fileType,
  quality,
  buffer,
}: CompressParams) => {
  const inputPath = path.join(COMPRESS_DIR, `input-${Date.now()}.pdf`);
  const outputPath = path.join(COMPRESS_DIR, `output-${Date.now()}.pdf`);

  fs.mkdirSync(COMPRESS_DIR, { recursive: true });
  fs.writeFileSync(inputPath, buffer);

  const cmd = `gs -sDEVICE=${FILE_TYPE[fileType]} -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
  await execAsync(cmd);

  const outputBuffer = fs.readFileSync(outputPath);

  // Clean up
  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputPath);

  return outputBuffer;
};
