const PAYMENT_KEY_PREFIX = 'clikpa_active_payment_'
const RETURN_ADDR_PROMPT_PREFIX = 'clikpa_return_addr_'

// Rule 6: Persist paymentId keyed by invoiceId so reload or return resumes the existing payment.
export function getStoredPaymentId(invoiceId) {
  if (!invoiceId || typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(`${PAYMENT_KEY_PREFIX}${invoiceId}`)
  } catch {
    return null
  }
}

export function setStoredPaymentId(invoiceId, paymentId) {
  if (!invoiceId || typeof window === 'undefined') return
  try {
    if (!paymentId) {
      window.localStorage.removeItem(`${PAYMENT_KEY_PREFIX}${invoiceId}`)
    } else {
      window.localStorage.setItem(`${PAYMENT_KEY_PREFIX}${invoiceId}`, paymentId)
    }
  } catch {
    // Ignore storage quota errors on low-end devices
  }
}

// Rule 8: Ask once for a return address on QR/address payments and remember what the payer saved/dismissed.
export function getStoredReturnAddressState(invoiceId) {
  if (!invoiceId || typeof window === 'undefined') return { address: '', prompted: false }
  try {
    const raw = window.localStorage.getItem(`${RETURN_ADDR_PROMPT_PREFIX}${invoiceId}`)
    if (!raw) return { address: '', prompted: false }
    const parsed = JSON.parse(raw)
    return {
      address: parsed?.address || '',
      prompted: Boolean(parsed?.prompted),
    }
  } catch {
    return { address: '', prompted: false }
  }
}

export function setStoredReturnAddressState(invoiceId, state) {
  if (!invoiceId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${RETURN_ADDR_PROMPT_PREFIX}${invoiceId}`, JSON.stringify(state))
  } catch {
    // Ignore storage quota errors
  }
}
