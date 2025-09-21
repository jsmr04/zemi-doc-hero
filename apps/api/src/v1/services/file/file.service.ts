import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BUCKET_NAME } from '@/configs';
import * as s3 from '@/lib/aws/s3';

export const uploadFile = async (uploadedFileName: string, buffer: Buffer) => {
  const uuid = uuidv4();
  const objectName = `${uuid}${path.extname(uploadedFileName)}`;

  await s3.putObject({
    bucket: BUCKET_NAME,
    objectPrefix: 'upload',
    objectName: objectName,
    body: buffer,
  });

  return objectName;
};
