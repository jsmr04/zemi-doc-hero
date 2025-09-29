import rateLimit from 'express-rate-limit';

const LIMIT_TIME = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

export default rateLimit({
  max: MAX_REQUESTS,
  windowMs: LIMIT_TIME,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
