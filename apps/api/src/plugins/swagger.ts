import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PORT } from '@/configs';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Template Documetation',
      version: '1.0.0',
      description: 'This is a template for yor server projects',
      contact: {
        name: 'Jose S/ Marmolejos',
        url: 'https://document-hero.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
      },
    ],
  },
  apis: ['./src/v1/docs/*.yaml'],
};

const specs = swaggerJsdoc(options);

export const swaggerMiddleware = {
  path: 'v1/api-docs',
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, { explorer: true }),
};
