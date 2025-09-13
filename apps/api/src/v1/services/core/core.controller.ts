import { Request, Response } from 'express';
import * as coreService from './core.service';
import { logger } from '@/plugins/winston';
import {
  MergeDocuments,
  SplitDocument,
  DeletePages,
  CompressDocument,
  SplitDocumentResponseData,
  GenericCoreResponseData,
} from './core.schema';
import { generateSuccessfulAPIResponse, generateErrorAPIResponse } from '@/helpers/api';

export const mergeDocuments = async (req: Request<unknown, unknown, MergeDocuments['body']>, res: Response) => {
  try {
    const { objects } = req.body;
    const url = await coreService.mergePdf(objects);
    return generateSuccessfulAPIResponse<GenericCoreResponseData>(res, { url });
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to merge PDFs.' });
  }
};

export const splitDocument = async (req: Request<unknown, unknown, SplitDocument['body']>, res: Response) => {
  try {
    const { objectName, ranges } = req.body;
    const splitDocuments = await coreService.splitPdf(objectName, ranges);
    const response = { files: splitDocuments };
    return generateSuccessfulAPIResponse<SplitDocumentResponseData>(res, response);
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to split PDF.' });
  }
};

export const deletePagesFromDocument = async (req: Request<unknown, unknown, DeletePages['body']>, res: Response) => {
  try {
    const { objectName, ranges } = req.body;
    const url = await coreService.deletePagesFromPdf(objectName, ranges);
    return generateSuccessfulAPIResponse<GenericCoreResponseData>(res, { url });
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to delete pages from PDF.' });
  }
};

export const compressDocument = async (req: Request<unknown, unknown, CompressDocument['body']>, res: Response) => {
  try {
    const { objectName, quality } = req.body;
    const url = await coreService.compressPdf(objectName, quality);
    return generateSuccessfulAPIResponse<GenericCoreResponseData>(res, { url });
  } catch (error) {
    logger.error(error);
    return generateErrorAPIResponse(res, { message: 'Unable to compress the PDF.' });
  }
};
