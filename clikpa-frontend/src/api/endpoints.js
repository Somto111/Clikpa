// Single source of truth for all ClikPa backend REST endpoints.
export const ENDPOINTS = {
  authRequestCode: '/auth/request-code',
  authVerifyCode: '/auth/verify-code',
  authLogin: '/auth/login',
  authWallet: '/auth/wallet',

  me: '/me',
  balance: '/balance',
  payments: '/payments',

  invoices: '/invoices',
  invoiceById: (id) => `/invoices/${encodeURIComponent(id)}`,
  invoiceIssue: (id) => `/invoices/${encodeURIComponent(id)}/issue`,
  invoiceCancelReplace: (id) => `/invoices/${encodeURIComponent(id)}/cancel-replace`,

  publicInvoice: (id) => `/public/invoices/${encodeURIComponent(id)}`,
  publicCreatePayment: (id) => `/public/invoices/${encodeURIComponent(id)}/payments`,
  publicPayment: (paymentId) => `/public/payments/${encodeURIComponent(paymentId)}`,
  publicPaymentCheck: (paymentId) => `/public/payments/${encodeURIComponent(paymentId)}/check`,
  publicReceipt: (paymentId) => `/public/receipts/${encodeURIComponent(paymentId)}`,

  withdrawalOptions: '/withdrawals/options',
  withdrawalQuote: '/withdrawals/quote',
  withdrawals: '/withdrawals',
  withdrawalById: (id) => `/withdrawals/${encodeURIComponent(id)}`,
}
