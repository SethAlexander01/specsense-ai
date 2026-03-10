import { z } from 'zod'

export const ExtractedSpecsSchema = z.object({
  material:           z.string().nullable().default(null),
  coating_finish:     z.string().nullable().default(null),
  surface_finish:     z.string().nullable().default(null),
  tolerance_general:  z.string().nullable().default(null),
  heat_treatment:     z.string().nullable().default(null),
  threads:            z.array(z.string()).default([]),
  standards:          z.array(z.string()).default([]),
  critical_dimensions: z.array(
    z.object({ name: z.string(), value: z.string() })
  ).default([]),
  notes:              z.array(z.string()).default([]),
  confidence:         z.number().min(0).max(1).default(0),
})

export type ExtractedSpecs = z.infer<typeof ExtractedSpecsSchema>
