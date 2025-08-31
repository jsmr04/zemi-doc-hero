import { Router } from "express";
import { coreRoute } from "./services/core";

export type Route = {
    routeName: string
    route: Router
}
const routes = [
    {routeName: "/core", route: coreRoute}
]

export default routes