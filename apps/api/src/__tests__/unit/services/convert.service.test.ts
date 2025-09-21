import { PDFDocument, PDFPage } from 'pdf-lib';
import { convertFile } from '@/v1/services/convert/convert.service';
import * as s3 from '@/lib/aws/s3';
import * as soffice from '@/lib/soffice';
import { ConvertFrom } from '@/v1/services/convert/convert.schema';

jest.mock('pdf-lib');
jest.mock('@/lib/aws/s3');
jest.mock('@/lib/soffice');

describe('Convert service TestSuite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('convert images to pdf', () => {
    const testCases = [
      { objectName: 'test.jpg', format: 'jpg', embedFn: 'embedJpg' },
      { objectName: 'test.png', format: 'png', embedFn: 'embedPng' },
    ];

    it.each(testCases)('should convert $format to pdf successfully', async ({ objectName, format, embedFn }) => {
      // Arrange
      const { mockBuffer, mockSavedPdfBuffer, mockPresignedUrl, mockPdfImage, mockPdfPage, mockPdfObject } =
        setupConvertServiceTest();
      (PDFDocument.create as jest.Mock).mockResolvedValue(mockPdfObject);
      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockBuffer);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Act
      const result = await convertFile(objectName, format as ConvertFrom);

      // Assert
      expect(result).toBe(mockPresignedUrl);
      expect(PDFDocument.create).toHaveBeenCalled();
      expect(mockPdfObject[embedFn as 'embedJpg' | 'embedPng']).toHaveBeenCalledWith(mockBuffer);
      expect(mockPdfObject.addPage).toHaveBeenCalledWith([mockPdfImage.width, mockPdfImage.height]);
      expect(mockPdfPage.drawImage).toHaveBeenCalledWith(mockPdfImage, {
        x: 0,
        y: 0,
        width: mockPdfImage.width,
        height: mockPdfImage.height,
      });
      expect(mockPdfObject.save).toHaveBeenCalled();
      expect(s3.getObjectAndConvertToBuffer).toHaveBeenCalledWith({
        objectPrefix: 'upload',
        objectName: objectName,
      });
      expect(s3.putObject).toHaveBeenCalledWith({
        objectPrefix: 'download',
        objectName: `${objectName.split('.')[0]}.pdf`,
        body: mockSavedPdfBuffer,
      });
      expect(s3.presignUrlFromExistingObject).toHaveBeenLastCalledWith({
        objectPrefix: 'download',
        objectName: `${objectName.split('.')[0]}.pdf`,
      });
    });
  });
  describe('Convert office documments to pdf', () => {
    const testCases = [
      { objectName: 'test.doc', format: 'doc' },
      { objectName: 'test.docx', format: 'docx' },
      { objectName: 'test.xls', format: 'xls' },
      { objectName: 'test.xlsx', format: 'xlsx' },
      { objectName: 'test.ppt', format: 'ppt' },
      { objectName: 'test.pptx', format: 'pptx' },
    ];
    it.each(testCases)('should convert $format to pdf successfully', async ({ objectName, format }) => {
      // Arrange
      const { mockBuffer, mockSavedPdfBuffer, mockPresignedUrl } = setupConvertServiceTest();

      (soffice.convertFileToPdf as jest.Mock).mockResolvedValue(mockSavedPdfBuffer);
      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockBuffer);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Act
      const result = await convertFile(objectName, format as ConvertFrom);

      // Assert
      expect(result).toBe(mockPresignedUrl);
      expect(soffice.convertFileToPdf).toHaveBeenCalledWith({
        inputFileName: objectName,
        outputFileName: `${objectName.split('.')[0]}.pdf`,
        buffer: mockBuffer,
      });
      expect(s3.getObjectAndConvertToBuffer).toHaveBeenCalledWith({
        objectPrefix: 'upload',
        objectName: objectName,
      });
      expect(s3.putObject).toHaveBeenCalledWith({
        objectPrefix: 'download',
        objectName: `${objectName.split('.')[0]}.pdf`,
        body: mockSavedPdfBuffer,
      });
      expect(s3.presignUrlFromExistingObject).toHaveBeenLastCalledWith({
        objectPrefix: 'download',
        objectName: `${objectName.split('.')[0]}.pdf`,
      });
    });
  });
  describe('Error handling', () => {
    it('should throw an exception when a non-supported file format is provided', async () => {
      // Arrange
      const { mockBuffer, mockPresignedUrl } = setupConvertServiceTest();

      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockBuffer);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Act + Assert
      await expect(convertFile('test.svg', 'svg' as unknown as ConvertFrom)).rejects.toThrow('Invalid file format');
    });

    it('should throw an exception when an invalid objectName is provided', async () => {
      // Arrange
      const { mockBuffer, mockPresignedUrl } = setupConvertServiceTest();

      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockBuffer);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Act + Assert
      await expect(convertFile('test', 'jpg')).rejects.toThrow('Invalid object name');
    });
  });
});

function setupConvertServiceTest() {
  const mockBuffer = Buffer.from('fake-data');
  const mockSavedPdfBuffer = Buffer.from('fake-saved-pdf');
  const mockPresignedUrl = 'https://presignedUrl/file.pdf';

  const mockPdfImage = {
    width: 100,
    height: 100,
  };

  const mockPdfPage = {
    drawImage: jest.fn(),
  } as unknown as PDFPage;

  const mockPdfObject = {
    embedJpg: jest.fn().mockResolvedValue(mockPdfImage),
    embedPng: jest.fn().mockResolvedValue(mockPdfImage),
    addPage: jest.fn().mockReturnValue(mockPdfPage),
    save: jest.fn().mockResolvedValue(mockSavedPdfBuffer),
  };

  return { mockBuffer, mockSavedPdfBuffer, mockPresignedUrl, mockPdfImage, mockPdfPage, mockPdfObject };
}
