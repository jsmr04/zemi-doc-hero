import fs from 'fs';
import path from 'path';
import { compress, CompressQuality } from '@/lib/ghostscript';

const MOCK_FILES_DIR = path.join(__dirname, '../../mocks');

describe('Ghostscript TestSuite', () => {
  const testCases = ['/screen', '/ebook', '/printer', '/prepress'];
  it.each(testCases)('should compress pdf using the quality: %s', async (pdfQuality: string) => {
    const filePath = `${MOCK_FILES_DIR}/file-example_PDF_1MB.pdf`;
    const mockBuffer = fs.readFileSync(filePath);

    const result = await compress({
      fileType: 'PDF',
      quality: pdfQuality as unknown as CompressQuality,
      buffer: mockBuffer,
      inputFileName: 'test-input-file.pdf',
      outputFileName: 'test-output-file.pdf',
    });

    const sizeBytes = Buffer.byteLength(result, 'utf8');
    const sizeKB = sizeBytes / 1024;
    expect(sizeKB).toBeLessThan(1024);
  });
});
