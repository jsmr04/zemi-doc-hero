import { z } from 'zod';

const FromEnum = z.enum(['jpg', 'png', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls']);
const ToEnum = z.enum(['pdf']);

export const ConvertSchema = z.object({
  body: z
    .object({
      objectName: z.string().nonempty({ error: 'Please provide the document (object).' }),
      from: FromEnum,
      to: ToEnum,
    })
    .strict(),
});

export type ConvertFrom = z.infer<typeof FromEnum>;
export type ConvertTo = z.infer<typeof ToEnum>;
export type Convert = z.infer<typeof ConvertSchema>;

export type GenericConvertResponseData = {
  url: string;
};
