import 'dotenv/config';

//TODO: Validate environment variables when starting the server
export const PORT = process.env.PORT!;
export const AWS_REGION = process.env.AWS_REGION!;
export const AWS_CUSTOM_PROFILE = process.env.AWS_CUSTOM_PROFILE!;
export const BUCKET_NAME = process.env.BUCKET_NAME!;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

export const API_PREFIX = process.env.API_PREFIX;
export const APP_NAME = process.env.APP_NAME;
export const LOG_PATH = process.env.LOG_PATH;
export const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
