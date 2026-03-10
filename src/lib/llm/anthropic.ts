import Anthropic from '@anthropic-ai/sdk'
import { ExtractedSpecsSchema, type ExtractedSpecs } from '@/lib/specs/schema'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Extraction system prompt — tuned for engineering PDFs
// ---------------------------------------------------------------------------
const EXTRACT_SYSTEM = `You are an expert engineering document analyst specialising in manufacturing specifications, technical drawings, GD&T, and international engineering standards.

Your task: extract structured specifications from engineering documents and output ONLY a single valid JSON object — no markdown, no code fences, no prose, no explanation.

Extraction rules:
- Copy values EXACTLY as they appear; do not paraphrase or abbreviate.
- Use null for any field that is absent or cannot be determined from the document.
- Use [] for array fields that have no data.
- material: full material designation including alloy and temper, e.g. "AISI 316L Stainless Steel" or "Aluminium 6061-T6 per AMS 2770".
- coating_finish: coating, plating, or anodising specification including thickness if stated, e.g. "Hard anodise Type III, 25 μm min per MIL-A-8625".
- surface_finish: surface roughness or texture requirement, e.g. "Ra 1.6 μm all over unless noted" or "125 μin RMS".
- tolerance_general: the default/general tolerance note, e.g. "±0.1 unless otherwise specified" or "ISO 2768-m".
- heat_treatment: full heat treatment or hardness requirement, e.g. "Quench & temper, 28–32 HRC" or "Normalise per ASTM A6".
- threads: list every thread call-out as a single string, e.g. "M8×1.25 – 6H", "1/4-20 UNC-2B THRU". Include class of fit if shown.
- standards: list every referenced standard, code, or specification number, e.g. "ISO 2768-m", "ASTM A276", "DIN 7168-m".
- critical_dimensions: named key dimensions with full value including units and tolerance, e.g. {"name":"Bore Ø","value":"25.000 +0.000/−0.013 mm"}.
- notes: general notes or revision notes from the drawing/document, each as a separate string.
- confidence: a number 0.0–1.0 representing your confidence in the extraction quality:
    1.0 = clear digital text with all fields present
    0.7 = most fields found, some ambiguity
    0.4 = sparse text, likely scanned or mostly graphical
    0.1 = almost no useful text extracted`

const SCHEMA_EXAMPLE = `{
  "material":           "string or null",
  "coating_finish":     "string or null",
  "surface_finish":     "string or null",
  "tolerance_general":  "string or null",
  "heat_treatment":     "string or null",
  "threads":            ["thread call-out string", ...],
  "standards":          ["standard code string", ...],
  "critical_dimensions":[{"name":"dimension name","value":"value with units and tolerance"}, ...],
  "notes":              ["note string", ...],
  "confidence":         0.0
}`

// ---------------------------------------------------------------------------
// extractSpecs
// ---------------------------------------------------------------------------
export async function extractSpecs(text: string): Promise<ExtractedSpecs> {
  const prompt = `Extract all engineering specifications from the document text below.

Output ONLY a JSON object that strictly matches this schema (all keys required):
${SCHEMA_EXAMPLE}

Document text:
${text.slice(0, 30_000)}`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: EXTRACT_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}'
  // Strip accidental code fences
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  const parsed = JSON.parse(jsonStr)
  return ExtractedSpecsSchema.parse(parsed)
}

// ---------------------------------------------------------------------------
// answerQuestion  (used by /api/chat)
// ---------------------------------------------------------------------------
export async function answerQuestion(
  contextChunks: string[],
  specsJson: string | null,
  history: Anthropic.MessageParam[],
  question: string,
  filename: string,
): Promise<string> {
  const context = contextChunks.join('\n\n---\n\n')
  const specsSection = specsJson
    ? `\n\nExtracted specifications (JSON):\n${specsJson}`
    : ''

  const system = `You are SpecSense AI, an expert engineering document assistant.

Document: "${filename}"

Document content:
${context.slice(0, 20_000)}${specsSection}

Answer accurately and concisely based only on the document. If information is absent, say so clearly. Use precise engineering terminology.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system,
    messages: [...history, { role: 'user', content: question }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
