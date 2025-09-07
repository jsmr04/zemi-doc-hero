import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BUCKET_NAME } from '@/configs';
import * as s3 from '@/lib/aws/s3';

export const uploadFile = async (document: Express.Multer.File) => {
  const uuid = uuidv4();
  const objectName = `${uuid}${path.extname(document.originalname)}`;

  await s3.putObject({
    bucket: BUCKET_NAME,
    objectPrefix: "upload",
    objectName: objectName,
    body: document.buffer,
  });

  return {
    object: objectName,
    fileName: document.originalname,
  };
};
