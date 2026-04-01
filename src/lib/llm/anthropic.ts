import Anthropic from '@anthropic-ai/sdk'
import { ExtractedSpecsSchema, type ExtractedSpecs } from '@/lib/specs/schema'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Extraction system prompt — tuned for engineering PDFs
// ---------------------------------------------------------------------------
const EXTRACT_SYSTEM = `You are an expert engineering document analyst. You can read any type of engineering or manufacturing document including:
- Technical / CAD drawings (mechanical, structural, electrical, PCB)
- Material data sheets and certifications
- Product specification sheets
- Welding procedure specifications (WPS)
- Assembly drawings and BOMs
- Quality / inspection specifications
- Process specifications

Your task: extract ALL structured specifications from the document and output ONLY a single valid JSON object — no markdown, no code fences, no prose, no explanation.

Extraction rules:
- Copy values EXACTLY as they appear in the document; do not paraphrase or abbreviate.
- Use null for any field that is absent or cannot be determined.
- Use [] for array fields with no data.
- part_number: the part number, item number, or product code shown in the title block or header.
- drawing_number: the drawing or document number (may differ from part number).
- revision: the revision letter or number, e.g. "Rev B", "C", "03".
- title: the document or part title/description from the title block.
- material: full material designation including alloy, grade, and temper, e.g. "AISI 316L Stainless Steel", "Aluminium 6061-T6 per AMS 2770", "A36 Structural Steel".
- heat_treatment: full heat treatment or hardness requirement, e.g. "Quench & temper, 28–32 HRC".
- coating_finish: coating, plating, or anodising specification including thickness if stated.
- surface_finish: surface roughness or texture requirement, e.g. "Ra 1.6 μm all over unless noted".
- tolerance_general: the default/general tolerance block, e.g. "±0.1 unless otherwise specified" or "ISO 2768-m".
- weight: mass or weight of the part/assembly including units, e.g. "2.4 kg", "5.3 lbs".
- threads: every thread call-out as a single string including class of fit, e.g. "M8×1.25 – 6H", "1/4-20 UNC-2B THRU".
- critical_dimensions: every named key dimension with full value, units, and tolerance, e.g. {"name":"Overall Length","value":"150.0 ±0.2 mm"}.
- process_requirements: manufacturing or assembly process requirements, e.g. "All welds to AWS D1.1", "Passivate per ASTM A967", "Degrease before coating".
- test_requirements: required tests, inspections, or certifications, e.g. "100% visual inspection", "Pressure test at 1.5× working pressure", "Cert of conformance required".
- operating_conditions: operating environment or service conditions, e.g. "−40°C to +85°C", "Max working pressure 200 bar", "IP67 rated".
- standards: every referenced standard, code, or specification number, e.g. "ISO 2768-m", "ASTM A276", "AWS D1.1".
- notes: every general note, revision note, or special instruction from the document, each as a separate string.
- confidence: 0.0–1.0 representing extraction quality (1.0 = clear digital doc with all fields; 0.7 = most fields found; 0.4 = scanned/graphical; 0.1 = almost no useful content).`

const SCHEMA_EXAMPLE = `{
  "part_number":         "string or null",
  "drawing_number":      "string or null",
  "revision":            "string or null",
  "title":               "string or null",
  "material":            "string or null",
  "heat_treatment":      "string or null",
  "coating_finish":      "string or null",
  "surface_finish":      "string or null",
  "tolerance_general":   "string or null",
  "weight":              "string or null",
  "threads":             ["thread call-out string", ...],
  "critical_dimensions": [{"name":"dimension name","value":"value with units and tolerance"}, ...],
  "process_requirements":["process requirement string", ...],
  "test_requirements":   ["test requirement string", ...],
  "operating_conditions":["operating condition string", ...],
  "standards":           ["standard code string", ...],
  "notes":               ["note string", ...],
  "confidence":          0.0
}`

// ---------------------------------------------------------------------------
// Shared JSON parser for spec responses
// ---------------------------------------------------------------------------
function parseSpecResponse(raw: string): ExtractedSpecs {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`No JSON object found in model response. Raw: ${raw.slice(0, 200)}`)
  }
  const jsonStr = raw.slice(start, end + 1)

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    throw new Error(`JSON.parse failed: ${(e as Error).message}. Snippet: ${jsonStr.slice(0, 200)}`)
  }

  const result = ExtractedSpecsSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Schema validation failed: ${result.error.message}`)
  }
  return result.data
}

// Detect actual file type from magic bytes — don't trust stored mime_type
function detectMediaType(buf: Buffer): { isPdf: boolean; imageMediaType: string } {
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return { isPdf: true, imageMediaType: '' } // %PDF
  }
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { isPdf: false, imageMediaType: 'image/png' } // PNG
  }
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    return { isPdf: false, imageMediaType: 'image/jpeg' } // JPEG
  }
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') {
    return { isPdf: false, imageMediaType: 'image/webp' }
  }
  // Fall back to stored mime_type hint
  return { isPdf: false, imageMediaType: 'image/png' }
}

// ---------------------------------------------------------------------------
// extractSpecsFromFile — vision extraction for scanned PDFs and images
// ---------------------------------------------------------------------------
export async function extractSpecsFromFile(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<ExtractedSpecs> {
  const base64 = fileBuffer.toString('base64')
  const prompt = `Extract all engineering specifications from this document.\n\nOutput ONLY a JSON object that strictly matches this schema (all keys required):\n${SCHEMA_EXAMPLE}`

  const { isPdf, imageMediaType } = detectMediaType(fileBuffer)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fileBlock: any
  if (isPdf) {
    fileBlock = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
  } else {
    // Use detected image type, fall back to stored mime_type if detection missed
    const resolvedType = imageMediaType || (mimeType.startsWith('image/') ? mimeType : 'image/png')
    fileBlock = { type: 'image', source: { type: 'base64', media_type: resolvedType, data: base64 } }
  }

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: EXTRACT_SYSTEM,
    messages: [{
      role: 'user',
      content: [fileBlock, { type: 'text', text: prompt }],
    }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}'
  return parseSpecResponse(raw)
}

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
    max_tokens: 8192,
    system: EXTRACT_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}'
  return parseSpecResponse(raw)
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
