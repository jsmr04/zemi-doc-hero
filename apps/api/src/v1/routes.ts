import { Router } from "express";
import { todoRoute } from "./services/todos";
import { authRoute } from "./services/auth";

export type Route = {
    routeName: string
    route: Router
}
const routes = [
    {routeName: "/todo", route: todoRoute},
    {routeName: "/auth", route: authRoute},
]

export default routes