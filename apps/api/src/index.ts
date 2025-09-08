import express, { Request, Response } from 'express';
import { PORT } from '@/configs';
import { plugins } from '@/plugins';
import routes, { Route } from '@/v1/routes';
import { logger, expressErrorLogger } from '@/plugins/winston';
import { swaggerMiddleware } from '@/plugins/swagger';
import { S3Client } from '@aws-sdk/client-s3';

const test: any;
const test2: any;
const test3: any;
const test4: any;
const test5: any;
const test6: any;
const test7: any;

//Create express instance
const app = express();

//Add server plugins to express
app.use(plugins);

//Health check
app.get('/', (req: Request, res: Response) =>
  res.status(200).send({
    uptime: process.uptime(),
    status: 'healthy 🙂 ',
    date: new Date(),
  }),
);

// Add routes
routes.forEach((item: Route) => app.use('/v1' + item.routeName, item.route));

//Global error logger middleware
app.use(expressErrorLogger);

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
