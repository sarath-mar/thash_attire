const PAGE_W = 595
const PAGE_H = 842
const LEFT = 36
const RIGHT = 559
const INK = '0.137 0.102 0.114'
const ROSE = '0.635 0.294 0.384'
const BLUSH = '0.941 0.824 0.831'
const IVORY = '1.000 0.973 0.965'
const WHITE = '1 1 1'
const MUTE = '0.478 0.392 0.408'

function pdfText(value) {
  return String(value ?? '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function money(amount) {
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0
  return `Rs. ${safe.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function textWidth(text, size, bold = false) {
  let units = 0
  for (const ch of String(text)) {
    if (ch === ' ') units += 280
    else if ('.,:\'|'.includes(ch)) units += 280
    else if (ch >= '0' && ch <= '9') units += 560
    else if ('iljtfrI'.includes(ch)) units += 320
    else if ('mwMW'.includes(ch)) units += 820
    else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) units += 680
    else units += 520
  }
  return (units / 1000) * size * (bold ? 1.04 : 1)
}

function wrapToWidth(text, size, maxWidth, bold = false) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines = []
  let current = ''
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (textWidth(next, size, bold) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  })
  if (current) lines.push(current)
  return lines
}

function orderPieces(order) {
  if (Array.isArray(order?.sale_items) && order.sale_items.length) return order.sale_items
  return [{
    product_name: order?.product_name || 'Custom order',
    quantity: order?.quantity || 1,
    selling_price: order?.selling_price || order?.final_amount || 0,
  }]
}

function fill(ops, x, y, w, h, color) {
  ops.push(`${color} rg`)
  ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`)
}

function stroke(ops, x, y, w, h, color) {
  ops.push('0.6 w')
  ops.push(`${color} RG`)
  ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`)
}

function hline(ops, x1, x2, y, color) {
  ops.push('0.6 w')
  ops.push(`${color} RG`)
  ops.push(`${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`)
}

function drawText(ops, x, y, text, size, font, color) {
  ops.push('BT')
  ops.push(`/${font} ${size} Tf`)
  ops.push(`${color} rg`)
  ops.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`)
  ops.push(`(${pdfText(text)}) Tj`)
  ops.push('ET')
}

function drawRight(ops, right, y, text, size, font, color, bold = false) {
  const x = right - textWidth(text, size, bold)
  drawText(ops, x, y, text, size, font, color)
}

function drawCenter(ops, center, y, text, size, font, color, bold = false) {
  const x = center - textWidth(text, size, bold) / 2
  drawText(ops, x, y, text, size, font, color)
}

function pageShell(ops, orderNumber, continued) {
  fill(ops, 0, 0, PAGE_W, PAGE_H, IVORY)
  fill(ops, 0, PAGE_H - 108, PAGE_W, 108, ROSE)
  drawText(ops, LEFT, PAGE_H - 52, 'THASH ATTIRE', 22, 'F2', WHITE)
  drawText(ops, LEFT, PAGE_H - 74, 'Made for one person only', 10, 'F3', '1 0.91 0.92')
  if (continued) {
    drawRight(ops, RIGHT, PAGE_H - 58, `Order ${orderNumber}`, 11, 'F1', WHITE)
    drawRight(ops, RIGHT, PAGE_H - 74, 'Continued', 9, 'F3', '1 0.91 0.92')
  } else {
    drawRight(ops, RIGHT, PAGE_H - 58, 'ORDER DETAILS', 11, 'F2', WHITE)
  }
}

function metaBox(ops, x, y, w, h, label, value) {
  fill(ops, x, y, w, h, WHITE)
  stroke(ops, x, y, w, h, BLUSH)
  drawText(ops, x + 12, y + h - 16, label.toUpperCase(), 8, 'F2', ROSE)
  const lines = wrapToWidth(value || '—', 11, w - 24)
  lines.slice(0, 2).forEach((line, index) => {
    drawText(ops, x + 12, y + h - 34 - index * 14, line, 11, 'F1', INK)
  })
}

function tableHeader(ops, y) {
  const h = 26
  fill(ops, LEFT, y - 8, RIGHT - LEFT, h, INK)
  drawText(ops, LEFT + 12, y, 'PIECE', 8, 'F2', WHITE)
  drawCenter(ops, 348, y, 'QTY', 8, 'F2', WHITE, true)
  drawRight(ops, 452, y, 'RATE', 8, 'F2', WHITE, true)
  drawRight(ops, RIGHT - 12, y, 'AMOUNT', 8, 'F2', WHITE, true)
  return y - h
}

function tableRow(ops, y, item, shaded) {
  const nameLines = wrapToWidth(item.product_name || 'Piece', 11, 250)
  const rowH = Math.max(28, 14 + nameLines.length * 14)
  if (shaded) fill(ops, LEFT, y - rowH + 16, RIGHT - LEFT, rowH, WHITE)
  nameLines.forEach((line, index) => {
    drawText(ops, LEFT + 12, y - index * 14, line, 11, 'F1', INK)
  })
  const mid = y - Math.max(0, (nameLines.length - 1) * 7)
  const qty = String(Number(item.quantity) || 1)
  const rate = money(item.selling_price)
  const amount = money((Number(item.selling_price) || 0) * (Number(item.quantity) || 1))
  drawCenter(ops, 348, mid, qty, 11, 'F1', INK)
  drawRight(ops, 452, mid, rate, 11, 'F1', INK)
  drawRight(ops, RIGHT - 12, mid, amount, 11, 'F2', INK, true)
  hline(ops, LEFT, RIGHT, y - rowH + 16, BLUSH)
  return y - rowH
}

function buildPages(order, labels) {
  const pieces = orderPieces(order)
  const pages = []
  let ops = []
  pages.push(ops)
  pageShell(ops, order?.order_number || '', false)

  let y = PAGE_H - 140
  drawText(ops, LEFT, y, order?.order_number || 'Order', 22, 'F2', INK)
  y -= 28
  const boxW = (RIGHT - LEFT - 12) / 2
  const boxH = 52
  const meta = [
    ['Placed', labels.placed || '—'],
    ['Payment', labels.payment || '—'],
    ['Expected', labels.expected || '—'],
    ['Customer', [order?.customer_name, order?.customer_phone].filter(Boolean).join('  ·  ') || '—'],
  ]
  meta.forEach((entry, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    metaBox(ops, LEFT + col * (boxW + 12), y - boxH - row * (boxH + 10), boxW, boxH, entry[0], entry[1])
  })
  y -= boxH * 2 + 28

  drawText(ops, LEFT, y, 'YOUR PIECES', 9, 'F2', ROSE)
  y -= 34
  y = tableHeader(ops, y)

  const subtotal = pieces.reduce((sum, item) => {
    return sum + (Number(item.selling_price) || 0) * (Number(item.quantity) || 1)
  }, 0)

  pieces.forEach((item, index) => {
    const nameLines = wrapToWidth(item.product_name || 'Piece', 11, 250)
    const rowH = Math.max(28, 14 + nameLines.length * 14)
    if (y - rowH < 150) {
      ops = []
      pages.push(ops)
      pageShell(ops, order?.order_number || '', true)
      y = PAGE_H - 140
      drawText(ops, LEFT, y, 'YOUR PIECES', 9, 'F2', ROSE)
      y -= 34
      y = tableHeader(ops, y)
    }
    y = tableRow(ops, y, item, index % 2 === 0)
  })

  const discount = Number(order?.discount) || 0
  const totalBlock = 36 + (discount > 0 ? 18 : 0) + 28
  if (y - totalBlock < 120) {
    ops = []
    pages.push(ops)
    pageShell(ops, order?.order_number || '', true)
    y = PAGE_H - 140
  }

  y -= 16
  const summaryTop = y
  const summaryH = 24 + (discount > 0 ? 18 : 0) + 28
  fill(ops, 330, summaryTop - summaryH, RIGHT - 330, summaryH, WHITE)
  stroke(ops, 330, summaryTop - summaryH, RIGHT - 330, summaryH, BLUSH)
  let lineY = summaryTop - 18
  drawText(ops, 344, lineY, 'Subtotal', 10, 'F1', MUTE)
  drawRight(ops, RIGHT - 12, lineY, money(subtotal), 10, 'F1', INK)
  if (discount > 0) {
    lineY -= 18
    drawText(ops, 344, lineY, 'Discount', 10, 'F1', MUTE)
    drawRight(ops, RIGHT - 12, lineY, money(discount), 10, 'F1', INK)
  }
  lineY -= 22
  drawText(ops, 344, lineY, 'Total', 13, 'F2', INK)
  drawRight(ops, RIGHT - 12, lineY, money(order?.final_amount), 13, 'F2', ROSE, true)
  y = summaryTop - summaryH - 28

  const address = order?.shipping_address || ''
  const note = order?.notes || ''
  if (address || note) {
    const addressLines = address ? wrapToWidth(address, 11, RIGHT - LEFT - 24) : []
    const noteLines = note ? wrapToWidth(note, 11, RIGHT - LEFT - 24) : []
    const blockH = 36 + addressLines.length * 14 + (note ? 20 + noteLines.length * 14 : 0)
    if (y - blockH < 56) {
      ops = []
      pages.push(ops)
      pageShell(ops, order?.order_number || '', true)
      y = PAGE_H - 140
    }
    fill(ops, LEFT, y - blockH, RIGHT - LEFT, blockH, WHITE)
    stroke(ops, LEFT, y - blockH, RIGHT - LEFT, blockH, BLUSH)
    let textY = y - 18
    if (address) {
      drawText(ops, LEFT + 12, textY, 'DELIVERY', 8, 'F2', ROSE)
      textY -= 16
      addressLines.forEach((line) => {
        drawText(ops, LEFT + 12, textY, line, 11, 'F1', INK)
        textY -= 14
      })
    }
    if (note) {
      textY -= 6
      drawText(ops, LEFT + 12, textY, 'NOTE', 8, 'F2', ROSE)
      textY -= 16
      noteLines.forEach((line) => {
        drawText(ops, LEFT + 12, textY, line, 11, 'F1', INK)
        textY -= 14
      })
    }
  }

  pages.forEach((pageOps, index) => {
    drawText(
      pageOps,
      LEFT,
      28,
      'A copy of your order. This is not a tax invoice.',
      8,
      'F3',
      MUTE,
    )
    drawRight(pageOps, RIGHT, 28, `${index + 1} / ${pages.length}`, 8, 'F1', MUTE)
  })

  return pages.map(pageOps => pageOps.join('\n') + '\n')
}

export function buildOrderPdf(order, labels = {}) {
  const streams = buildPages(order, labels)
  const objects = []
  const add = (body) => {
    objects.push(body)
    return objects.length
  }

  const regularId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const boldId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  const italicId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>')
  const pageIds = []

  streams.forEach((stream) => {
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`)
    const pageId = add(
      `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${regularId} 0 R /F2 ${boldId} 0 R /F3 ${italicId} 0 R >> >> >>`,
    )
    pageIds.push(pageId)
  })

  const pagesId = add(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] >>`)
  objects.forEach((body, index) => {
    objects[index] = body.replaceAll('PAGES_ID', String(pagesId))
  })
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
  return pdf
}

export function downloadOrderPdf(order, labels = {}) {
  const pdf = buildOrderPdf(order, labels)
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const number = String(order?.order_number || 'order').replace(/[^\w-]+/g, '')
  link.href = url
  link.download = `thash-attire-${number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
