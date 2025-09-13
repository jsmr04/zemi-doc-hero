import { z } from 'zod';

export default z.object({
  PORT: z.string().min(1),
  AWS_REGION: z.string().min(1),
  BUCKET_NAME: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
});
