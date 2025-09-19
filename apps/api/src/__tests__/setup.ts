// jest.mock('@/plugins/winston', () => ({
//   logger: {
//     info: jest.fn(),
//     error: jest.fn(),
//     warn: jest.fn(),
//     debug: jest.fn(),
//   },
//   expressLogger: jest.fn(),
//   expressErrorLogger: jest.fn(),
// }));

// jest.mock('@/lib/aws/s3', () => ({
//   putObject: jest.fn(),
//   getObjectAndConvertToBuffer: jest.fn(),
//   presignUrlFromExistingObject: jest.fn(),
// }));

// jest.mock('@/lib/soffice', () => ({
//   compress: jest.fn(),
// }));

// jest.mock('@/lib/ghostscript', () => ({
//   convertFileToPdf: jest.fn(),
// }));

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.AWS_REGION = 'us-east-1';
process.env.BUCKET_NAME = 'test-bucket';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
