import cors, { corsMiddleware } from './cors';
import bodyParser from './bodyParser';
import session from './session';
import helmet from './helmet';
import { expressLogger } from './winston';

export const plugins = [bodyParser, cors, corsMiddleware, helmet, session, expressLogger];
