import { uploadFile } from '@/v1/services/file/file.service';
import { v4 as uuidv4 } from 'uuid';
import { putObject } from '@/lib/aws/s3';

jest.mock('uuid');
jest.mock('@/lib/aws/s3');

describe('File service TestSuite', () => {
  it('should upload file to S3 bucket', async () => {
    //Arrange
    const mockInput = {
      originalname: 'test.docx',
      buffer: Buffer.from('fake-data'),
    };
    const mockResult = 'output.docx';

    (uuidv4 as jest.Mock).mockReturnValue('output');
    (putObject as jest.Mock).mockResolvedValue(undefined);

    //Act
    const result = await uploadFile(mockInput.originalname, mockInput.buffer);

    //Assert
    expect(result).toBe(mockResult);
    expect(putObject).toHaveBeenCalled();
    expect(uuidv4).toHaveBeenCalled();
  });
  it('should throw an exception when S3 client fails', async () => {
    //Arrange
    const mockInput = {
      originalname: 'test.docx',
      buffer: Buffer.from('fake-data'),
    };
    (uuidv4 as jest.Mock).mockReturnValue('output');
    (putObject as jest.Mock).mockRejectedValue(new Error('Failed to upload file'));

    //Act + assert
    await expect(uploadFile(mockInput.originalname, mockInput.buffer)).rejects.toThrow();
  });
});
