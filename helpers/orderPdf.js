function pdfText(value) {
  return String(value ?? '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function money(amount) {
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0
  return `Rs. ${safe.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function wrap(text, width = 78) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines = []
  let current = ''
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > width && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  })
  if (current) lines.push(current)
  return lines
}

export function orderPdfLines(order, labels = {}) {
  const items = Array.isArray(order?.sale_items) && order.sale_items.length
    ? order.sale_items
    : [{
        product_name: order?.product_name || 'Custom order',
        quantity: order?.quantity || 1,
        selling_price: order?.selling_price || order?.final_amount || 0,
      }]

  const lines = [
    { text: 'THASH ATTIRE', size: 18, gap: 22 },
    { text: 'Order details', size: 12, gap: 22 },
    { text: `Order ${order?.order_number || ''}`, size: 13, gap: 18 },
    { text: `Placed ${labels.placed || ''}` },
    { text: `Status ${labels.status || ''}` },
    { text: `Payment ${labels.payment || ''}` },
    { text: '' },
    { text: 'Pieces', size: 13, gap: 18 },
  ]

  items.forEach((item) => {
    const name = item.product_name || 'Piece'
    const qty = Number(item.quantity) || 1
    const price = money((Number(item.selling_price) || 0) * qty)
    wrap(`${name}  x${qty}  ${price}`, 72).forEach((text) => lines.push({ text }))
  })

  if (Number(order?.discount) > 0) {
    lines.push({ text: '' })
    lines.push({ text: `Discount ${money(order.discount)}` })
  }

  lines.push({ text: '' })
  lines.push({ text: `Total ${money(order?.final_amount)}`, size: 13, gap: 20 })

  if (order?.shipping_address) {
    lines.push({ text: 'Delivery', size: 13, gap: 18 })
    wrap(order.shipping_address, 72).forEach((text) => lines.push({ text }))
  }
  if (labels.expected) lines.push({ text: `Expected ${labels.expected}` })
  if (order?.customer_name) lines.push({ text: order.customer_name })
  if (order?.customer_phone) lines.push({ text: order.customer_phone })
  if (order?.notes) {
    lines.push({ text: '' })
    lines.push({ text: 'Note', size: 13, gap: 18 })
    wrap(order.notes, 72).forEach((text) => lines.push({ text }))
  }

  lines.push({ text: '' })
  lines.push({ text: 'A copy of your order. This is not a tax invoice.', size: 9, gap: 14 })
  return lines
}

function pageStream(lines, pageHeight, margin) {
  let cursor = pageHeight - margin
  let content = ''
  const pages = []

  const flush = () => {
    pages.push(content)
    content = ''
    cursor = pageHeight - margin
  }

  lines.forEach((line) => {
    const size = line.size || 11
    const gap = line.gap ?? 16
    if (cursor - gap < margin) flush()
    content += `BT /F1 ${size} Tf 1 0 0 1 ${margin} ${cursor.toFixed(2)} Tm (${pdfText(line.text)}) Tj ET\n`
    cursor -= gap
  })

  if (content || !pages.length) pages.push(content)
  return pages
}

export function buildOrderPdf(lines) {
  const pageWidth = 595
  const pageHeight = 842
  const margin = 48
  const streams = pageStream(lines, pageHeight, margin)
  const objects = []

  const add = (body) => {
    objects.push(body)
    return objects.length
  }

  const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const pageIds = []
  streams.forEach((stream) => {
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`)
    const pageId = add(
      `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    )
    pageIds.push(pageId)
  })

  const pagesId = add(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`)
  objects[pagesId - 1] = objects[pagesId - 1]
  objects.forEach((body, index) => {
    objects[index] = body.replace('PAGES_ID', String(pagesId))
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
  const pdf = buildOrderPdf(orderPdfLines(order, labels))
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
