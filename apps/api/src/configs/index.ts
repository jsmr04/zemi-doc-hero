import 'dotenv/config';
import envSchema from './envSchema';

const { PORT, BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = envSchema.parse(process.env);

export { PORT, BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY };

//TODO: Remove
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
