import { Router } from "express";
import { coreRoute } from "./services/core";
import { fileRoute } from "./services/file";

export type Route = {
    routeName: string
    route: Router
}
const routes = [
    {routeName: "/core", route: coreRoute},
    {routeName: "/file", route: fileRoute}
]

export default routes