import { z } from "zod";

export const GetTodoByIdDTO = z.object({
    id: z.number({ error: "Id is required" })
})

export type GetTodoById = z.infer<typeof GetTodoByIdDTO>


// //INFO: For documentation, please refer to https://express-validator.github.io/docs/index.html
// export const checkTodoId = checkSchema({
//     id: {
//         in: ["params"],
//         errorMessage: "Id is required",
//         isInt: true,
//         toInt: true
//     }
// })

// export const checkTodoBody = checkSchema({
//     id: {
//         in: ["body"],
//         errorMessage: "Id is required",
//         isInt: true,
//         toInt: true
//     },
//     userId: {
//         in: ["body"],
//         errorMessage: "User Id is required",
//         isInt: true,
//         toInt: true
//     },
//     completed: {
//         in: ["body"],
//         isBoolean: true,
//         errorMessage: "Ivalid value"
//     }

// })