import { Request, Response } from 'express';
import * as coreService from './core.service';
import { logger } from '@/plugins/winston';
import {
  MergeDocuments,
  SplitDocument,
  DeletePages,
  CompressDocument,
} from './core.schema';

export const mergeDocuments = async (
  req: Request<{}, {}, MergeDocuments['body']>,
  res: Response,
) => {
  try {
    const { objects } = req.body;
    const url = await coreService.mergePdf(objects);
    return res.send({ url });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'Failed to merge PDFs.' });
  }
};

export const splitDocument = async (
  req: Request<{}, {}, SplitDocument['body']>,
  res: Response,
) => {
  try {
    const { objectName, ranges } = req.body;
    const splitDocuments = await coreService.splitPdf(objectName, ranges);
    return res.send(splitDocuments);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'Failed to split PDF.' });
  }
};

export const deletePagesFromDocument = async (
  req: Request<{}, {}, DeletePages['body']>,
  res: Response,
) => {
  try {
    const { objectName, ranges } = req.body;
    const url = await coreService.deletePagesFromPdf(objectName, ranges);
    return res.send({ url });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'Failed to delete pages from PDF' });
  }
};

export const compressDocument = async (
  req: Request<{}, {}, CompressDocument['body']>,
  res: Response,
) => {
  try {
    const { objectName, quality } = req.body;
    const url = await coreService.compressPdf(objectName, quality);
    return res.send({ url });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: 'Failed to compress PDF' });
  }
};
