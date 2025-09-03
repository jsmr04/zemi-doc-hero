import express, { Request, Response } from 'express';
import expressListEndpoints from "express-list-endpoints";
import { PORT, API_PREFIX } from "@/configs";
import { plugins } from "@/plugins";
import routes, { Route } from "@/v1/routes";
import { logger, expressErrorLogger } from "@/plugins/winston";
import { swaggerMiddleware } from "@/plugins/swagger";

//Create express instance
const app = express()

//Add server plugins to express
app.use(plugins)

//Health check
app.get('/', (req: Request, res: Response) => res.status(200).send({
    uptime: process.uptime(),
    status: "healthy 🙂 ",
    date: new Date()
}))

// Add routes
routes.forEach((item: Route) => app.use('/v1' + item.routeName, item.route));

//Global error logger middleware
app.use(expressErrorLogger)

//Swagger
const { path, serve, setup } = swaggerMiddleware
app.use(path, serve, setup)

//Start server
app.listen(PORT, () => {
    // Print endpoints - NOT WORKING
    // const endpoints = expressListEndpoints(app);
    // console.log(endpoints)

    logger.info(`Listening on ${PORT}`)
})

