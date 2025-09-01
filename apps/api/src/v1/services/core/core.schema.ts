import { z } from "zod";

export const SplitDocumentSchema = z.object({
    ranges: z.array(
        z.tuple([
            z.number().int(),
            z.number().int()
        ])
    ).nonempty({ error: "At least one range is required." })
        .refine(ranges => ranges.every(([start, end]) => start <= end),
            { error: "Each range must have start <= end." }
        )
})

export type SplitDocument = z.infer<typeof SplitDocumentSchema>
