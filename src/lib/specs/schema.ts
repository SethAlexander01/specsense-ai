import { z } from 'zod'

export const ExtractedSpecsSchema = z.object({
  // Identification
  part_number:          z.string().nullable().default(null),
  drawing_number:       z.string().nullable().default(null),
  revision:             z.string().nullable().default(null),
  title:                z.string().nullable().default(null),

  // Material & processing
  material:             z.string().nullable().default(null),
  heat_treatment:       z.string().nullable().default(null),
  coating_finish:       z.string().nullable().default(null),
  surface_finish:       z.string().nullable().default(null),

  // Geometry & tolerances
  tolerance_general:    z.string().nullable().default(null),
  weight:               z.string().nullable().default(null),
  threads:              z.array(z.string()).default([]),
  critical_dimensions:  z.array(
    z.object({ name: z.string(), value: z.string() })
  ).default([]),

  // Requirements
  process_requirements: z.array(z.string()).default([]),
  test_requirements:    z.array(z.string()).default([]),
  operating_conditions: z.array(z.string()).default([]),
  standards:            z.array(z.string()).default([]),

  // General
  notes:                z.array(z.string()).default([]),
  confidence:           z.number().min(0).max(1).default(0),
})

export type ExtractedSpecs = z.infer<typeof ExtractedSpecsSchema>
