import express from 'express';
import { plugins } from '@/plugins';
import routes from '@/v1/routes';
import { healthCheck } from '@/v1/health-check';
import { expressErrorLogger } from '@/plugins/winston';

export const createTestApp = () => {
  //Create express instance
  const app = express();

  //Add server plugins to express
  app.use(plugins);

  //Health check
  app.use(healthCheck);

  // Add routes
  routes.forEach((route) => {
    app.use('/v1' + route.routeName, route.route);
  });

  //Global error logger middleware
  app.use(expressErrorLogger);

  return app;
};
