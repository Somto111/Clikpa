export function formatUsd(amount) {
  const num = Number(amount || 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatNgn(amount) {
  const num = Number(amount || 0)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatTokenAmount(amount, symbol = '') {
  const num = Number(amount || 0)
  const decimals = num % 1 === 0 ? 2 : Math.min(6, Math.max(2, String(num.toFixed(6)).replace(/0+$/, '').split('.')[1]?.length || 2))
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
  return symbol ? `${formatted} ${symbol}` : formatted
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function truncateMiddle(value, startChars = 7, endChars = 6) {
  if (!value || typeof value !== 'string') return ''
  if (value.length <= startChars + endChars + 3) return value
  return `${value.slice(0, startChars)}...${value.slice(-endChars)}`
}

// Rule 10: No tax calculation. Single optional Discount (amount or percent) before issuing.
export function calculateInvoiceTotals(items = [], discount = null) {
  const subtotalCents = items.reduce((sum, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0)
    const unitCents = Math.round((Number(item.unitPrice) || 0) * 100)
    return sum + Math.round(qty * unitCents)
  }, 0)

  let discountCents = 0
  if (discount && Number(discount.value) > 0) {
    if (discount.type === 'percent') {
      const pct = Math.min(100, Math.max(0, Number(discount.value)))
      discountCents = Math.round((subtotalCents * pct) / 100)
    } else {
      discountCents = Math.min(subtotalCents, Math.round(Number(discount.value) * 100))
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents)

  return {
    subtotal: subtotalCents / 100,
    discountAmount: discountCents / 100,
    total: totalCents / 100,
  }
}

export function getPayUrl(invoiceId) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clikpa.app'
  return `${origin}/pay/${invoiceId}`
}

// Rule 5: Prepare WhatsApp message or Email draft; opening does NOT mean sent.
export function buildWhatsAppShareUrl({ phone = '', customerName, businessName, invoiceNumber, total, dueDate, payUrl }) {
  const cleanPhone = String(phone || '').replace(/[^\d]/g, '')
  const greeting = customerName ? `Hi ${customerName},` : 'Hello,'
  const duePart = dueDate ? ` (due ${formatDate(dueDate)})` : ''
  const message = `${greeting} here is invoice ${invoiceNumber} from ${businessName} for ${formatUsd(total)}${duePart}.\n\nView and pay securely here:\n${payUrl}`
  const encoded = encodeURIComponent(message)
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}

export function buildEmailShareUrl({ email = '', customerName, businessName, invoiceNumber, total, dueDate, payUrl }) {
  const subject = `Invoice ${invoiceNumber} from ${businessName} (${formatUsd(total)})`
  const greeting = customerName ? `Hello ${customerName},` : 'Hello,'
  const duePart = dueDate ? `\nDue date: ${formatDate(dueDate)}` : ''
  const body = `${greeting}\n\nPlease find your invoice ${invoiceNumber} from ${businessName}.\nAmount due: ${formatUsd(total)}${duePart}\n\nPay online using this link:\n${payUrl}\n\nThank you,\n${businessName}`
  return `mailto:${encodeURIComponent(email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
