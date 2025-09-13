import { Response } from 'express';

type SuccessHttpCodeKeys = 'OK' | 'Created' | 'Accepted';
type ClientErrorHttpCodeKeys =
  | 'Bad Request'
  | 'Unauthorized'
  | 'Forbidden'
  | 'Not Found'
  | 'Payload Too Large'
  | 'Unsupported Media Type';
type ServerErrorHttpCodeKeys = 'Internal Server Error' | 'Bad Gateway' | 'Service Unavailable';
type AllHttpCodeKeys = SuccessHttpCodeKeys | ClientErrorHttpCodeKeys | ServerErrorHttpCodeKeys;

export interface ApiError {
  message: string;
  details?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

const HTTP_CODE: Record<AllHttpCodeKeys, number> = {
  OK: 200,
  Created: 201,
  Accepted: 202,

  'Bad Request': 400,
  Unauthorized: 401,
  Forbidden: 403,
  'Not Found': 404,
  'Payload Too Large': 413,
  'Unsupported Media Type': 415,

  'Internal Server Error': 500,
  'Bad Gateway': 502,
  'Service Unavailable': 503,
};

export const generateSuccessfulAPIResponse = <T>(res: Response, data: T, httpStatus: SuccessHttpCodeKeys = 'OK') => {
  const httpCode = HTTP_CODE[httpStatus];
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  return res.status(httpCode).send(response);
};

export const generateErrorAPIResponse = (
  res: Response,
  error: ApiError,
  httpStatus: ClientErrorHttpCodeKeys | ServerErrorHttpCodeKeys = 'Internal Server Error',
) => {
  const httpCode = HTTP_CODE[httpStatus];
  const response: ApiResponse = {
    success: false,
    error: error,
  };
  return res.status(httpCode).send(response);
};
