import { z } from "zod";

//TODO: Create middleware for Zop schema validations

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

export const DeletePagesSchema = z.object({
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

const FileQualityEnum = z.enum(["low", "good-for-ebooks", "good", "high"])
export const CompressDocumentSchema = z.object({
    quality: FileQualityEnum
})

export type SplitDocument = z.infer<typeof SplitDocumentSchema>
export type DeletePages = z.infer<typeof DeletePagesSchema>
export type FileQuality = z.infer<typeof FileQualityEnum>
export type CompressDocument = z.infer<typeof CompressDocumentSchema>
