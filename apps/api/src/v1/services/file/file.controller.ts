import { Request, Response } from 'express';
import * as fileService from './file.service';

export const uploadFile = async (req: Request, res: Response) => {
  const document = req.file as Express.Multer.File;
  if (!document)
    return res.status(400).json({ error: 'Please upload a file.' });

  const uploadedFile = await fileService.uploadFile(document);

  return res.send(uploadedFile);
};
