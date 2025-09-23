import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import * as s3 from '@/lib/aws/s3';
import * as ghostscript from '@/lib/ghostscript';
import { mergePdf } from '@/v1/services/core/core.service';

jest.mock('pdf-lib');
jest.mock('uuid');
jest.mock('@/lib/aws/s3');
jest.mock('@/lib/ghostscript');

describe('Core Service TestSuite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Merge pdf files', () => {
    //Arrange
    const mockObjects: string[] = ['test-1.pdf', 'test-1.pdf', 'test-1.pdf'];
    const mockMergedDocumentName = 'merged';
    const mockPresignedUrl = `https://presignedUrl/${mockMergedDocumentName}.pdf`;
    const mockDownloadedDocument = Buffer.from('fake-document');
    const mockSavedPdfBuffer = Buffer.from('fake-saved-pdf');

    const mockSavedPdfDocument = {
      buffer: mockSavedPdfBuffer,
    };
    const mockCreatedPdf = {
      copyPages: jest.fn().mockReturnValue([undefined]),
      addPage: jest.fn().mockReturnValue(undefined),
      save: jest.fn().mockResolvedValue(mockSavedPdfDocument),
    };

    const mockLoadedPdf = {
      getPageIndices: jest.fn().mockReturnValue(1),
    };

    beforeEach(() => {
      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockDownloadedDocument);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);
      (PDFDocument.load as jest.Mock).mockResolvedValue(mockLoadedPdf);
      (PDFDocument.create as jest.Mock).mockResolvedValue(mockCreatedPdf);
      (uuidv4 as jest.Mock).mockReturnValue(mockMergedDocumentName);
    });

    it('should merge 2 or more pdf files into one', async () => {
      // Act
      const result = await mergePdf(mockObjects);
      // Assert
      expect(result).toBe(mockPresignedUrl);
      expect(s3.getObjectAndConvertToBuffer).toHaveBeenCalledTimes(mockObjects.length);
      expect(s3.putObject).toHaveBeenCalledWith({
        objectPrefix: 'download',
        objectName: `${mockMergedDocumentName}.pdf`,
        body: mockSavedPdfBuffer,
      });
      expect(s3.presignUrlFromExistingObject).toHaveBeenCalledWith({
        objectPrefix: 'download',
        objectName: `${mockMergedDocumentName}.pdf`,
      });
      expect(PDFDocument.load).toHaveBeenCalledWith(mockDownloadedDocument);
      expect(PDFDocument.create).toHaveBeenCalled();
      expect(uuidv4).toHaveBeenCalled();
    });

    it('should throw an exception when the object list is missing', async () => {
      // Act + assert
      await expect(mergePdf([])).rejects.toThrow();
    });
  });
  describe('Split pdf', () => {
    it.todo('should split pdf into 2 files');
    it.todo('should split pdf into 5 files');
    it.todo('should throw an exception when the object name is missing');
    it.todo('should throw an exception when the range is missing');
  });
  describe('Delete pages', () => {
    it.todo('should delete 1 page from the document');
    it.todo('should delete a range of pages [3-6] from the document');
    it.todo('should delete multiple ranges of pages [1-2, 7-10, 11-11] from the document');
    it.todo('should throw an exception when all pages are asked to be deleted');
    it.todo('should throw an exception when the range is missing');
  });
  describe('Compress pdf', () => {
    it.todo('should compress the pdf file using a valid quality');
    it.todo('should throw an exception when the quality is invalid');
  });
});
