import { z } from "zod"

export const extractSchema = z.object({
  body: z.object({
    text: z.string().trim(),
  }),
})

export type TExtractSchema = z.infer<typeof extractSchema>
