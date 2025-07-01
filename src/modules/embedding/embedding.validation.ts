import { z } from "zod"

export const extractSchema = z.object({
  body: z.object({
    texts: z.array(z.string().trim()),
  }),
})

export type TExtractSchema = z.infer<typeof extractSchema>
