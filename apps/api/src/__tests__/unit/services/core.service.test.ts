import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import * as s3 from '@/lib/aws/s3';
import * as ghostscript from '@/lib/ghostscript';
import { compressPdf, deletePagesFromPdf, mergePdf, splitPdf } from '@/v1/services/core/core.service';
import { FileQuality } from '@/v1/services/core/core.schema';

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
    const {
      mockCreatedPdf,
      mockDownloadedDocument,
      mockLoadedPdf,
      mockMergedDocumentName,
      mockPresignedUrl,
      mockSavedPdfBuffer,
    } = setupCoreServiceTest();

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
    const { mockCreatedPdf, mockDownloadedDocument, mockLoadedPdf, mockPresignedUrl } = setupCoreServiceTest();

    beforeEach(() => {
      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockDownloadedDocument);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);
      (PDFDocument.load as jest.Mock).mockResolvedValue(mockLoadedPdf);
      (PDFDocument.create as jest.Mock).mockResolvedValue(mockCreatedPdf);
    });

    const successfulTestCases = [
      { ranges: [[0, 0]] },
      {
        ranges: [
          [0, 4],
          [5, 9],
        ],
      },
      {
        ranges: [
          [3, 5],
          [4, 6],
          [1, 2],
        ],
      },
      {
        ranges: [
          [2, 2],
          [4, 4],
          [6, 7],
          [1, 5],
          [9, 10],
        ],
      },
    ];
    it.each(successfulTestCases)('should split pdf. Range: $ranges', async ({ ranges }) => {
      const result = await splitPdf('test.pdf', ranges);
      expect(result).toHaveLength(ranges.length);
    });

    const failTestCases = [
      { ranges: [[-1, 1]], error: 'Invalid range. Range cannot be a negative value' },
      {
        ranges: [[3, 2]],
        error: 'Invalid range. Start should be lower than End',
      },
      {
        ranges: [
          [3, 5],
          [4, 1],
          [1, 2],
        ],
        error: 'Invalid range. Start should be lower than End',
      },
    ];
    it.each(failTestCases)('should throw an exception when the range is invalid. $error', async ({ ranges, error }) => {
      await expect(splitPdf('test.pdf', ranges)).rejects.toThrow(error);
    });
  });
  describe('Delete pages', () => {
    const testCases = [
      {
        documentPageCount: 10,
        ranges: [
          [1, 1],
          [5, 8],
        ],
        expectedResult: [0, 2, 3, 4, 9],
      },
      {
        documentPageCount: 5,
        ranges: [[0, 0]],
        expectedResult: [1, 2, 3, 4],
      },
      {
        documentPageCount: 5,
        ranges: [[4, 4]],
        expectedResult: [0, 1, 2, 3],
      },
      {
        documentPageCount: 3,
        ranges: [
          [1, 1],
          [6, 6],
          [8, 12],
        ],
        expectedResult: [0, 2],
      },
    ];

    it.each(testCases)(
      'should delete page/s from the document',
      async ({ documentPageCount, ranges, expectedResult }) => {
        const { mockCreatedPdf, mockDownloadedDocument, mockLoadedPdf, mockPresignedUrl } = setupCoreServiceTest();
        const newMockLoadedPdf = { ...mockLoadedPdf, getPageCount: jest.fn().mockReturnValue(documentPageCount) };

        (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockDownloadedDocument);
        (s3.putObject as jest.Mock).mockResolvedValue(undefined);
        (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);
        (PDFDocument.load as jest.Mock).mockResolvedValue(newMockLoadedPdf);
        (PDFDocument.create as jest.Mock).mockResolvedValue(mockCreatedPdf);

        const result = await deletePagesFromPdf('test.pdf', ranges);

        expect(result).toBe(mockPresignedUrl);
        expect(mockCreatedPdf.copyPages).toHaveBeenCalled();
        const [, pagesToKeep] = mockCreatedPdf.copyPages.mock.calls[0];
        expect(pagesToKeep).toEqual(expectedResult);
      },
    );

    const failTestCases = [
      { ranges: [[-1, 0]], error: 'Invalid range. Range cannot be a negative value' },
      { ranges: [[1, 0]], error: 'Invalid range. Start should be lower than End' },
      { ranges: [[0, 0]], error: 'It is not possible to delete all the pages from the document' },
    ];

    it.each(failTestCases)('should throw an exception. $error', async ({ ranges, error }) => {
      const { mockCreatedPdf, mockDownloadedDocument, mockLoadedPdf, mockPresignedUrl } = setupCoreServiceTest();
      const newMockLoadedPdf = { ...mockLoadedPdf, getPageCount: jest.fn().mockReturnValue(1) };

      (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockDownloadedDocument);
      (s3.putObject as jest.Mock).mockResolvedValue(undefined);
      (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);
      (PDFDocument.load as jest.Mock).mockResolvedValue(newMockLoadedPdf);
      (PDFDocument.create as jest.Mock).mockResolvedValue(mockCreatedPdf);

      await expect(deletePagesFromPdf('test.pdf', ranges)).rejects.toThrow(error);
    });
  });
  describe('Compress pdf', () => {
    const { mockDownloadedDocument, mockPresignedUrl, mockSavedPdfBuffer } = setupCoreServiceTest();
    (s3.getObjectAndConvertToBuffer as jest.Mock).mockResolvedValue(mockDownloadedDocument);
    (s3.putObject as jest.Mock).mockResolvedValue(undefined);
    (s3.presignUrlFromExistingObject as jest.Mock).mockResolvedValue(mockPresignedUrl);
    (ghostscript.compress as jest.Mock).mockResolvedValue(mockSavedPdfBuffer);

    it('should compress the pdf file using a valid quality', async () => {
      const result = await compressPdf('test.pdf', 'low');
      expect(result).toBe(mockPresignedUrl);
    });

    it('should throw an exception when the quality is invalid', async () => {
      await expect(compressPdf('test.pdf', 'not-valid' as unknown as FileQuality)).rejects.toThrow();
    });
  });
});

function setupCoreServiceTest() {
  const mockDownloadedDocument = Buffer.from('fake-document');
  const mockMergedDocumentName = 'document';
  const mockPresignedUrl = `https://presignedUrl/${mockMergedDocumentName}.pdf`;
  const mockLoadedPdf = {
    getPageIndices: jest.fn().mockReturnValue(1),
  };
  const mockSavedPdfBuffer = Buffer.from('fake-saved-pdf');

  const mockSavedPdfDocument = {
    buffer: mockSavedPdfBuffer,
  };

  const mockCreatedPdf = {
    copyPages: jest.fn().mockResolvedValue([]),
    addPage: jest.fn().mockReturnValue(undefined),
    save: jest.fn().mockResolvedValue(mockSavedPdfDocument),
  };

  return {
    mockDownloadedDocument,
    mockMergedDocumentName,
    mockPresignedUrl,
    mockLoadedPdf,
    mockSavedPdfBuffer,
    mockCreatedPdf,
  };
}
