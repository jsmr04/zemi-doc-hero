import { checkSchema } from 'express-validator';

//INFO: For documentation, please refer to https://express-validator.github.io/docs/index.html

export const checkCredentialsBody = checkSchema({
  username: {
    in: ['body'],
    errorMessage: 'Username is required',
    isString: true,
  },
  password: {
    in: ['body'],
    errorMessage: 'Password Id is required',
    isString: true,
  },
});
