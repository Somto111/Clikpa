import { ENDPOINTS } from './endpoints'
import { handleMockRequest } from './mock'

const AUTH_TOKEN_KEY = 'clikpa_auth_token'
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
export const IS_MOCK_ENABLED = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return
  try {
    if (!token) {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
    } else {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token)
    }
  } catch {
    // Ignore storage quota issues
  }
}

function normaliseError(err, fallbackMessage = 'Something went wrong while connecting to ClikPa. Your funds and data are safe.') {
  if (!err) {
    return { code: 'UNKNOWN_ERROR', message: fallbackMessage, retryable: true }
  }
  const status = err.status || 0
  const retryable =
    typeof err.retryable === 'boolean'
      ? err.retryable
      : status === 0 || status === 408 || status === 429 || status >= 500

  // Never surface raw technical codes or stack traces in `message`.
  const safeMessage =
    typeof err.message === 'string' && !/^(TypeError|SyntaxError|Failed to fetch)/i.test(err.message)
      ? err.message
      : 'We could not reach ClikPa on your current connection. Check your internet and try again.'

  return {
    code: err.code || (status ? `HTTP_${status}` : 'NETWORK_ERROR'),
    message: safeMessage,
    retryable,
  }
}

export async function apiRequest(method, path, { body, auth = true } = {}) {
  try {
    if (IS_MOCK_ENABLED) {
      const isPublicOrAuth = path.startsWith('/public/') || path.startsWith('/auth/')
      if (auth && !isPublicOrAuth && !getAuthToken()) {
        const unauth = new Error('Please sign in to access your ClikPa business account.')
        unauth.code = 'UNAUTHORIZED'
        unauth.status = 401
        unauth.retryable = false
        throw unauth
      }
      return await handleMockRequest(method, path, body)
    }

    const headers = {
      Accept: 'application/json',
    }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    const isPublicOrAuth = path.startsWith('/public/') || path.startsWith('/auth/')
    if (auth && !isPublicOrAuth) {
      const token = getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    let payload = null
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      payload = await response.json()
    }

    if (!response.ok) {
      const apiErr = new Error(
        payload?.message ||
          (response.status === 401
            ? 'Your session ended. Sign in again to continue.'
            : 'We could not complete that request right now. Please try again.'),
      )
      apiErr.code = payload?.code || `HTTP_${response.status}`
      apiErr.retryable = payload?.retryable ?? response.status >= 500
      apiErr.status = response.status
      throw apiErr
    }

    return payload
  } catch (err) {
    throw normaliseError(err)
  }
}

export const api = {
  // Auth
  requestCode: (email) => apiRequest('POST', ENDPOINTS.authRequestCode, { body: { email }, auth: false }),
  verifyCode: (email, code) => apiRequest('POST', ENDPOINTS.authVerifyCode, { body: { email, code }, auth: false }),
  loginWithPassword: (email, password) =>
    apiRequest('POST', ENDPOINTS.authLogin, { body: { email, password }, auth: false }),
  loginWithWallet: (walletAddress, signature) =>
    apiRequest('POST', ENDPOINTS.authWallet, { body: { walletAddress, signature }, auth: false }),

  // Merchant profile, wallet & ledger
  getMe: () => apiRequest('GET', ENDPOINTS.me),
  updateMe: (patch) => apiRequest('PATCH', ENDPOINTS.me, { body: patch }),
  getBalance: () => apiRequest('GET', ENDPOINTS.balance),
  getPayments: () => apiRequest('GET', ENDPOINTS.payments),

  // Invoices
  getInvoices: () => apiRequest('GET', ENDPOINTS.invoices),
  getInvoice: (id) => apiRequest('GET', ENDPOINTS.invoiceById(id)),
  createInvoiceDraft: (data) => apiRequest('POST', ENDPOINTS.invoices, { body: data }),
  updateInvoiceDraft: (id, data) => apiRequest('PATCH', ENDPOINTS.invoiceById(id), { body: data }),
  issueInvoice: (id) => apiRequest('POST', ENDPOINTS.invoiceIssue(id)),
  cancelAndReplaceInvoice: (id) => apiRequest('POST', ENDPOINTS.invoiceCancelReplace(id)),

  // Public payer & receipt endpoints
  getPublicInvoice: (id) => apiRequest('GET', ENDPOINTS.publicInvoice(id), { auth: false }),
  createPublicPayment: (id, payload) =>
    apiRequest('POST', ENDPOINTS.publicCreatePayment(id), { body: payload, auth: false }),
  getPublicPayment: (paymentId) => apiRequest('GET', ENDPOINTS.publicPayment(paymentId), { auth: false }),
  checkPublicPayment: (paymentId, payload) =>
    apiRequest('POST', ENDPOINTS.publicPaymentCheck(paymentId), { body: payload, auth: false }),
  getPublicReceipt: (paymentId) => apiRequest('GET', ENDPOINTS.publicReceipt(paymentId), { auth: false }),

  // Withdrawals
  getWithdrawalOptions: () => apiRequest('GET', ENDPOINTS.withdrawalOptions),
  getWithdrawalQuote: (payload) => apiRequest('POST', ENDPOINTS.withdrawalQuote, { body: payload }),
  createWithdrawal: (payload) => apiRequest('POST', ENDPOINTS.withdrawals, { body: payload }),
  getWithdrawal: (id) => apiRequest('GET', ENDPOINTS.withdrawalById(id)),
}
