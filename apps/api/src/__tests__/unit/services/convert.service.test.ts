import { PDFDocument, PDFImage, PDFPage, SaveOptions } from 'pdf-lib';
import { convertFile } from '@/v1/services/convert/convert.service';
import * as s3 from '@/lib/aws/s3';
import { ConvertFrom } from '@/v1/services/convert/convert.schema';

jest.mock('pdf-lib');
jest.mock('@/lib/aws/s3');

describe('Convert service TestSuite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('convert images', () => {
    const testCases = [
      { objectName: 'test.jpg', format: 'jpg', embedFn: 'embedJpg' },
      { objectName: 'test.png', format: 'png', embedFn: 'embedPng' },
    ];

    it.each(testCases)('should convert $format to pdf successfully', async ({ objectName, format, embedFn }) => {
      const mockBuffer = Buffer.from('fake-image-data');
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
});
