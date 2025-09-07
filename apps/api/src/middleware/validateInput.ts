import { logger } from "@/plugins/winston";
import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

const validateInpunt = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
        body: req.body,
        params: req.params
    })

    if (!parsed.success) {
        logger.error(JSON.stringify(parsed.error.format()))
        return res.status(400).json({
            error: "Invalid input.",
            details: parsed.error.format()
        })
    }

    req.body = parsed.data.body ?? req.body
    req.params = (parsed.data.params ?? req.params) as any

    next()
}

export default validateInpunt