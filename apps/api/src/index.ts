import express from 'express';
import { PORT } from '@/configs';
import { plugins } from '@/plugins';
import routes, { Route } from '@/v1/routes';
import { logger, expressErrorLogger } from '@/plugins/winston';
import { swaggerMiddleware } from '@/plugins/swagger';
import { healthCheck } from '@/v1/health-check';
import { uploadFileErrorHandler } from '@/middleware/fileUploader';

//Create express instance
const app = express();

//Add server plugins to express
app.use(plugins);

//Health check
app.get('/', healthCheck);

//Add routes
routes.forEach((item: Route) => app.use('/v1' + item.routeName, item.route));

//Global error logger middleware
app.use(expressErrorLogger);

//Multer error handling middleware
app.use(uploadFileErrorHandler);

//Swagger
const { path, serve, setup } = swaggerMiddleware;
app.use(path, serve, setup);

//Start server
app.listen(PORT, () => {
  // Print endpoints - NOT WORKING
  // const endpoints = expressListEndpoints(app);
  // console.log(endpoints)

  logger.info(`Listening on ${PORT}`);
});
