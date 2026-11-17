const PAGE_W = 595
const PAGE_H = 842
const LEFT = 46
const RIGHT = 549
const IVORY = '0.984 0.957 0.925'
const BLUSH = '0.941 0.725 0.741'
const ROSE = '0.851 0.439 0.478'
const INK = '0.137 0.102 0.114'
const MUTE = '0.435 0.376 0.388'
const RULE = '0.851 0.439 0.478'

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
  return `Rs. ${safe.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
  if (!words.length) return []
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
  ops.push('0.8 w')
  ops.push(`${color} RG`)
  ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`)
}

function hline(ops, x1, x2, y, color = RULE) {
  ops.push('0.7 w')
  ops.push(`${color} RG`)
  ops.push(`${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`)
}

function drawText(ops, x, y, text, size, font, color) {
  const value = pdfText(text)
  if (!value) return
  ops.push('BT')
  ops.push(`/${font} ${size} Tf`)
  ops.push(`${color} rg`)
  ops.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`)
  ops.push(`(${value}) Tj`)
  ops.push('ET')
}

function drawRight(ops, right, y, text, size, font, color, bold = false) {
  drawText(ops, right - textWidth(text, size, bold), y, text, size, font, color)
}

function paymentLines(order, labels) {
  const lines = [['Method', labels.method || 'Paid']]
  if (labels.app) lines.push(['UPI app', labels.app])
  if (labels.paidOn) lines.push(['Paid on', labels.paidOn])
  if (labels.transaction) lines.push(['Transaction', labels.transaction])
  lines.push(['Amount', money(order?.final_amount)])
  return lines
}

function buildPages(order, labels) {
  const pieces = orderPieces(order)
  const discount = Number(order?.discount) || 0
  const subtotal = pieces.reduce((sum, item) => {
    return sum + (Number(item.selling_price) || 0) * (Number(item.quantity) || 1)
  }, 0)
  const addressLines = wrapToWidth(order?.shipping_address || '', 10, 230)
  const payments = paymentLines(order, labels)
  const ops = []

  fill(ops, 0, 0, PAGE_W, PAGE_H, IVORY)
  fill(ops, 0, 0, PAGE_W, 548, BLUSH)

  drawText(ops, LEFT, 786, 'Thash Attire', 28, 'F4', ROSE)
  drawText(ops, LEFT, 754, 'Made for one person only', 9, 'F3', MUTE)
  drawText(ops, LEFT, 740, 'hello@thashattire.com', 9, 'F1', MUTE)
  if (labels.companyPhone) drawText(ops, LEFT, 726, labels.companyPhone, 9, 'F1', MUTE)

  drawRight(ops, RIGHT, 786, 'Invoice #', 9, 'F2', INK, true)
  drawRight(ops, RIGHT, 768, order?.order_number || '—', 12, 'F2', INK, true)
  drawRight(ops, RIGHT, 746, 'Invoice Date', 9, 'F2', INK, true)
  drawRight(ops, RIGHT, 730, labels.placed || '—', 11, 'F1', INK)

  const customerTop = labels.companyPhone ? 692 : 706
  drawText(ops, LEFT, customerTop, order?.customer_name || 'Customer', 12, 'F2', INK)
  let cursor = customerTop - 16
  if (order?.customer_phone) {
    drawText(ops, LEFT, cursor, order.customer_phone, 10, 'F1', MUTE)
    cursor -= 14
  }
  addressLines.slice(0, 3).forEach((line) => {
    drawText(ops, LEFT, cursor, line, 10, 'F1', MUTE)
    cursor -= 13
  })

  drawText(ops, LEFT, 500, 'Invoice', 26, 'F2', INK)

  const tableLeft = 214
  const priceX = 430
  const qtyX = 478
  const totalX = RIGHT

  drawText(ops, tableLeft, 528, 'Description', 11, 'F2', INK)
  drawRight(ops, priceX, 528, 'Price', 11, 'F2', INK, true)
  drawText(ops, qtyX - textWidth('QTY', 11, true) / 2, 528, 'QTY', 11, 'F2', INK)
  drawRight(ops, totalX, 528, 'Total', 11, 'F2', INK, true)
  hline(ops, tableLeft, RIGHT, 520)

  let rowY = 498
  pieces.forEach((item) => {
    if (rowY < 250) return
    const qty = Number(item.quantity) || 1
    const rate = Number(item.selling_price) || 0
    const name = wrapToWidth(item.product_name || 'Piece', 11, 150)[0] || 'Piece'
    const qtyText = String(qty)
    drawText(ops, tableLeft, rowY, name, 11, 'F1', INK)
    drawRight(ops, priceX, rowY, money(rate), 11, 'F1', INK)
    drawText(ops, qtyX - textWidth(qtyText, 11) / 2, rowY, qtyText, 11, 'F1', INK)
    drawRight(ops, totalX, rowY, money(rate * qty), 11, 'F1', INK)
    hline(ops, tableLeft, RIGHT, rowY - 8)
    rowY -= 28
  })

  const totalsTop = Math.max(rowY - 8, 210)
  hline(ops, 390, RIGHT, totalsTop + 16)
  drawText(ops, 394, totalsTop, 'Subtotal', 11, 'F1', INK)
  drawRight(ops, totalX, totalsTop, money(subtotal), 11, 'F1', INK)
  let totalY = totalsTop - 20
  if (discount > 0) {
    drawText(ops, 394, totalY, 'Discount', 11, 'F1', INK)
    drawRight(ops, totalX, totalY, money(discount), 11, 'F1', INK)
    totalY -= 20
  }
  hline(ops, 390, RIGHT, totalY + 14)
  drawText(ops, 394, totalY - 4, 'Total', 12, 'F2', INK)
  drawRight(ops, totalX, totalY - 4, money(order?.final_amount), 12, 'F2', INK, true)

  hline(ops, LEFT, RIGHT, 148)
  drawText(ops, LEFT, 126, 'Payment details', 11, 'F2', INK)
  payments.forEach((entry, index) => {
    const y = 106 - index * 16
    drawText(ops, LEFT, y, entry[0], 10, 'F1', MUTE)
    drawText(ops, LEFT + 92, y, entry[1], 10, 'F1', INK)
  })

  return [ops.join('\n') + '\n']
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
  const scriptId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>')
  const pageIds = []

  streams.forEach((stream) => {
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`)
    const pageId = add(
      `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${regularId} 0 R /F2 ${boldId} 0 R /F3 ${italicId} 0 R /F4 ${scriptId} 0 R >> >> >>`,
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
