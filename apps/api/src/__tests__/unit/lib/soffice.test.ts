import fs from 'fs';
import path from 'path';
import { convertFileToPdf } from '@/lib/soffice';

const MOCK_FILES_DIR = path.join(__dirname, '../../mocks');
const JEST_TIMEOUT = 30000;
const PDF_HEADER = '25504446';

describe('Soffice (Libre Office) TestSuite', () => {
  const testCases = [
    'file-sample_100kB.doc',
    'file-sample_100kB.docx',
    'file_example_XLS_10.xls',
    'file_example_XLSX_1000.xlsx',
    'file_example_PPT_250kB.ppt',
    'file-sample_PPT_400KB.pptx',
  ];
  it.each(testCases)(
    'should convert %s to pdf',
    async (fileName: string) => {
      const filePath = `${MOCK_FILES_DIR}/${fileName}`;
      const mockBuffer = fs.readFileSync(filePath);

      const result = await convertFileToPdf({
        buffer: mockBuffer,
        inputFileName: fileName,
        outputFileName: `${fileName.split('.')[0]}.pdf`,
      });

      const header = result.slice(0, 4).toString('hex');
      expect(header).toBe(PDF_HEADER);
    },
    JEST_TIMEOUT,
  );
});
