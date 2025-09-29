import path from 'path';
import express from 'express';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/plugins/winston';

export interface MulterS3File extends Express.Multer.File {
  key: string;
}

export class MulterS3Storage implements multer.StorageEngine {
  private s3: S3Client;
  private bucket: string;

  constructor(s3: S3Client, bucket: string) {
    this.s3 = s3;
    this.bucket = bucket;
  }
  async _handleFile(
    req: express.Request,
    file: Express.Multer.File,
    callback: (error?: unknown, info?: Partial<MulterS3File>) => void,
  ): Promise<void> {
    const uuid = uuidv4();
    const key = `${uuid}${path.extname(file.originalname)}`;
    const fullPath = `upload/${key}`;
    const params = {
      Bucket: this.bucket,
      Key: fullPath,
      Body: file.stream,
      ContentType: file.mimetype,
    };

    const upload = new Upload({ client: this.s3, params });

    try {
      await upload.done();
      const fileInfo: Partial<MulterS3File> = {
        key,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size ?? 0,
      };

      callback(null, fileInfo);
    } catch (err) {
      logger.error(err);
      callback(Error('Unable to upload file.'));
    }
  }
  _removeFile(req: express.Request, file: Express.Multer.File, callback: (error: Error | null) => void): void {
    callback(null);
  }
}
