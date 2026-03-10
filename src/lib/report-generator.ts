/**
 * Generates a PDF Spec Summary Report using pdf-lib (pure Node.js).
 * Matches the ExtractedSpecs schema (flat string fields + typed arrays).
 */
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib'
import type { Document } from '@/types/database'
import type { ExtractedSpecs } from '@/lib/specs/schema'

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const BLUE       = rgb(0.13, 0.37, 0.87)
const DARK       = rgb(0.07, 0.09, 0.12)
const GRAY       = rgb(0.45, 0.50, 0.56)
const LIGHT_GRAY = rgb(0.94, 0.95, 0.97)
const ACCENT_BG  = rgb(0.94, 0.96, 1.00)
const WHITE      = rgb(1, 1, 1)
const GREEN      = rgb(0.06, 0.47, 0.27)
const AMBER      = rgb(0.70, 0.43, 0.04)
const RED        = rgb(0.75, 0.10, 0.10)

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const PAGE_W      = 612
const PAGE_H      = 792
const MARGIN      = 48
const CONTENT_W   = PAGE_W - MARGIN * 2
const BOTTOM_STOP = 70   // y below which we flip to a new page
const KV_VALUE_X  = MARGIN + 140  // x-offset for value column in KV rows
const KV_VALUE_W  = CONTENT_W - 140

// ---------------------------------------------------------------------------
// Drawing context
// ---------------------------------------------------------------------------
interface Ctx {
  pdf:  PDFDocument
  page: PDFPage
  font: PDFFont
  bold: PDFFont
  y:    number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function newPage(ctx: Ctx): void {
  ctx.page = ctx.pdf.addPage([PAGE_W, PAGE_H])
  ctx.y = PAGE_H - MARGIN
}

function ensureSpace(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < BOTTOM_STOP) newPage(ctx)
}

/** Naïve word-wrap that respects a max pixel width. */
function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const candidate = cur ? `${cur} ${word}` : word
    if (cur && font.widthOfTextAtSize(candidate, size) > maxW) {
      lines.push(cur)
      cur = word
    } else {
      cur = candidate
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

/** Draw wrapped text, advancing ctx.y. */
function drawWrapped(
  ctx: Ctx,
  text: string,
  x: number,
  opts: { size?: number; color?: ReturnType<typeof rgb>; font?: PDFFont; maxW?: number } = {},
): void {
  const { size = 9, color = DARK } = opts
  const font  = opts.font  ?? ctx.font
  const maxW  = opts.maxW  ?? (PAGE_W - x - MARGIN)
  const lines = wrapText(text, font, size, maxW)

  for (const line of lines) {
    ensureSpace(ctx, size + 5)
    ctx.page.drawText(line, { x, y: ctx.y, size, font, color })
    ctx.y -= size + 5
  }
}

function drawSectionHeader(ctx: Ctx, title: string): void {
  ensureSpace(ctx, 38)
  ctx.y -= 10
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 5, width: CONTENT_W, height: 22, color: BLUE })
  ctx.page.drawText(title.toUpperCase(), {
    x: MARGIN + 10, y: ctx.y, size: 9, font: ctx.bold, color: WHITE,
  })
  ctx.y -= 28
}

/** Key–value row: bold key left, wrapped value right. */
function drawKV(ctx: Ctx, key: string, value: string | null | undefined): void {
  if (!value?.trim()) return
  const lines = wrapText(value, ctx.font, 9, KV_VALUE_W)
  ensureSpace(ctx, lines.length * 14 + 4)

  ctx.page.drawText(key, { x: MARGIN + 10, y: ctx.y, size: 9, font: ctx.bold, color: DARK })
  for (const line of lines) {
    ctx.page.drawText(line, { x: KV_VALUE_X, y: ctx.y, size: 9, font: ctx.font, color: DARK })
    ctx.y -= 14
  }
  // if key had fewer lines than value (always 1), align
  if (lines.length === 0) ctx.y -= 14
}

function drawBulletItem(ctx: Ctx, text: string): void {
  const lines = wrapText(text, ctx.font, 9, CONTENT_W - 24)
  ensureSpace(ctx, lines.length * 14 + 2)

  ctx.page.drawText('•', { x: MARGIN + 10, y: ctx.y, size: 9, font: ctx.bold, color: BLUE })
  for (const line of lines) {
    ctx.page.drawText(line, { x: MARGIN + 22, y: ctx.y, size: 9, font: ctx.font, color: DARK })
    ctx.y -= 14
  }
}

function drawNumberedItem(ctx: Ctx, index: number, text: string): void {
  const lines = wrapText(text, ctx.font, 9, CONTENT_W - 30)
  ensureSpace(ctx, lines.length * 14 + 4)

  ctx.page.drawText(`${index}.`, { x: MARGIN + 10, y: ctx.y, size: 9, font: ctx.bold, color: DARK })
  for (const line of lines) {
    ctx.page.drawText(line, { x: MARGIN + 28, y: ctx.y, size: 9, font: ctx.font, color: DARK })
    ctx.y -= 14
  }
  ctx.y -= 3
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function generateSpecReport(doc: Document, userEmail: string): Promise<Buffer> {
  const pdf  = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const firstPage = pdf.addPage([PAGE_W, PAGE_H])
  const ctx: Ctx = { pdf, page: firstPage, font, bold, y: PAGE_H - MARGIN }

  const specs = doc.extracted_specs as ExtractedSpecs | null

  // -------------------------------------------------------------------------
  // Page 1 header bar
  // -------------------------------------------------------------------------
  firstPage.drawRectangle({ x: 0, y: PAGE_H - 58, width: PAGE_W, height: 58, color: BLUE })
  firstPage.drawText('SPECSENSE AI', {
    x: MARGIN, y: PAGE_H - 28, size: 20, font: bold, color: WHITE,
  })
  firstPage.drawText('Spec Summary Report', {
    x: MARGIN, y: PAGE_H - 44, size: 10, font, color: rgb(0.75, 0.85, 1),
  })
  firstPage.drawText(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    { x: PAGE_W - MARGIN - 140, y: PAGE_H - 38, size: 9, font, color: rgb(0.75, 0.85, 1) },
  )

  ctx.y = PAGE_H - 58 - 14

  // -------------------------------------------------------------------------
  // Document info box
  // -------------------------------------------------------------------------
  const BOX_H = 56
  firstPage.drawRectangle({
    x: MARGIN, y: ctx.y - BOX_H, width: CONTENT_W, height: BOX_H,
    color: ACCENT_BG, borderWidth: 0,
  })

  firstPage.drawText(doc.filename, {
    x: MARGIN + 12, y: ctx.y - 14, size: 12, font: bold, color: DARK,
    maxWidth: CONTENT_W - 24,
  })
  firstPage.drawText(userEmail, {
    x: MARGIN + 12, y: ctx.y - 28, size: 9, font, color: GRAY,
  })

  if (specs?.confidence != null) {
    const pct   = Math.round(specs.confidence * 100)
    const cColor = pct >= 80 ? GREEN : pct >= 50 ? AMBER : RED
    firstPage.drawText(`Extraction confidence: ${pct}%`, {
      x: MARGIN + 12, y: ctx.y - 44, size: 8, font: bold, color: cColor,
    })
  }

  ctx.y -= BOX_H + 16

  // -------------------------------------------------------------------------
  // No specs guard
  // -------------------------------------------------------------------------
  if (!specs) {
    ensureSpace(ctx, 40)
    ctx.page.drawText('No specifications have been extracted for this document yet.', {
      x: MARGIN + 10, y: ctx.y, size: 10, font, color: GRAY,
    })
    ctx.y -= 20
    ctx.page.drawText('Process the document and run AI extraction in SpecSense AI.', {
      x: MARGIN + 10, y: ctx.y, size: 9, font, color: GRAY,
    })
  } else {
    // -----------------------------------------------------------------------
    // Material & Process
    // -----------------------------------------------------------------------
    drawSectionHeader(ctx, 'Material & Process')
    drawKV(ctx, 'Material',           specs.material)
    drawKV(ctx, 'Heat Treatment',     specs.heat_treatment)
    drawKV(ctx, 'Coating / Finish',   specs.coating_finish)
    drawKV(ctx, 'Surface Finish',     specs.surface_finish)
    drawKV(ctx, 'General Tolerance',  specs.tolerance_general)

    if (
      !specs.material && !specs.heat_treatment && !specs.coating_finish &&
      !specs.surface_finish && !specs.tolerance_general
    ) {
      ensureSpace(ctx, 18)
      ctx.page.drawText('None extracted.', { x: MARGIN + 10, y: ctx.y, size: 9, font, color: GRAY })
      ctx.y -= 14
    }

    // -----------------------------------------------------------------------
    // Threads
    // -----------------------------------------------------------------------
    if (specs.threads.length > 0) {
      drawSectionHeader(ctx, 'Thread Specifications')
      for (const t of specs.threads) drawBulletItem(ctx, t)
    }

    // -----------------------------------------------------------------------
    // Standards
    // -----------------------------------------------------------------------
    if (specs.standards.length > 0) {
      drawSectionHeader(ctx, 'Referenced Standards')
      for (const s of specs.standards) drawBulletItem(ctx, s)
    }

    // -----------------------------------------------------------------------
    // Critical Dimensions
    // -----------------------------------------------------------------------
    if (specs.critical_dimensions.length > 0) {
      drawSectionHeader(ctx, 'Critical Dimensions')

      // Column header
      ensureSpace(ctx, 22)
      ctx.page.drawRectangle({
        x: MARGIN, y: ctx.y - 4, width: CONTENT_W, height: 18, color: LIGHT_GRAY,
      })
      ctx.page.drawText('DIMENSION', {
        x: MARGIN + 10, y: ctx.y, size: 8, font: bold, color: GRAY,
      })
      ctx.page.drawText('VALUE / TOLERANCE', {
        x: MARGIN + 230, y: ctx.y, size: 8, font: bold, color: GRAY,
      })
      ctx.y -= 18

      specs.critical_dimensions.forEach((d, i) => {
        const valLines = wrapText(d.value, font, 9, CONTENT_W - 230 - 10)
        ensureSpace(ctx, valLines.length * 14 + 4)

        if (i % 2 === 0) {
          ctx.page.drawRectangle({
            x: MARGIN, y: ctx.y - 3, width: CONTENT_W, height: valLines.length * 14 + 4,
            color: rgb(0.98, 0.98, 0.99),
          })
        }

        ctx.page.drawText(d.name, {
          x: MARGIN + 10, y: ctx.y, size: 9, font: bold, color: DARK, maxWidth: 210,
        })
        for (const line of valLines) {
          ctx.page.drawText(line, { x: MARGIN + 230, y: ctx.y, size: 9, font, color: DARK })
          ctx.y -= 14
        }
        // If name had just one row but value had more, we've already advanced ctx.y enough
        // If name row shorter than value rows, that's fine — name is anchored to first line
      })
      ctx.y -= 4
    }

    // -----------------------------------------------------------------------
    // Notes
    // -----------------------------------------------------------------------
    if (specs.notes.length > 0) {
      drawSectionHeader(ctx, 'Engineering Notes')
      specs.notes.forEach((note, i) => drawNumberedItem(ctx, i + 1, note))
    }
  }

  // -------------------------------------------------------------------------
  // Footer on every page (drawn after all content so page count is final)
  // -------------------------------------------------------------------------
  const pageCount = pdf.getPageCount()
  for (let i = 0; i < pageCount; i++) {
    const p = pdf.getPage(i)
    p.drawLine({
      start: { x: MARGIN, y: 50 },
      end:   { x: PAGE_W - MARGIN, y: 50 },
      thickness: 0.5,
      color: LIGHT_GRAY,
    })
    p.drawText('Generated by SpecSense AI — Confidential Engineering Document', {
      x: MARGIN, y: 34, size: 8, font, color: GRAY,
    })
    p.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: PAGE_W - MARGIN - 72, y: 34, size: 8, font, color: GRAY,
    })
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}
