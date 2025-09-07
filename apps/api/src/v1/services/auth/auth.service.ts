import { Credentials } from './auth.types';
import { credentialList } from './auth.model';
import { logger } from '../../../plugins/winston';
import { generateToken } from '../../../helpers/security';

//INFO: Add your all business logic here

const credentials = [...credentialList];
export const login = (creds: Credentials) => {
  logger.info(' -> auth.login()');

  const checkCredentials = (item: Credentials) =>
    item.username === creds.username && item.password === creds.password;
  const isAuthenticated = credentials.some(checkCredentials);

  if (isAuthenticated) {
    const token = generateToken({ username: creds.username });
    return token;
  }
};
