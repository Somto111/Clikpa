import { calculateInvoiceTotals } from '../utils/format'

const MOCK_STORAGE_KEY = 'clikpa_mock_db_v1'
const MOCK_MODE_KEY = 'clikpa_mock_override_v1'

export const SUPPORTED_NETWORKS = [
  {
    id: 'tron',
    name: 'Tron',
    badge: 'TRC-20',
    eta: '~1 min',
    feeUsd: 1.2,
    wrongChainWarning:
      'Many exchanges default to Ethereum (ERC-20) or BNB Smart Chain when sending USDT. Double-check you selected Tron (TRC-20) before sending.',
    depositAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', rateUsd: 1.0 },
      { symbol: 'USDC', name: 'USD Coin', rateUsd: 1.0 },
    ],
  },
  {
    id: 'base',
    name: 'Base',
    badge: 'Base L2',
    eta: '~15 sec',
    feeUsd: 0.35,
    wrongChainWarning: null,
    depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', rateUsd: 1.0 },
      { symbol: 'ETH', name: 'Ether', rateUsd: 2650.0 },
    ],
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    badge: 'BEP-20',
    eta: '~30 sec',
    feeUsd: 0.5,
    wrongChainWarning:
      'Make sure your wallet or exchange is set to BNB Smart Chain (BEP-20), not opBNB or Ethereum.',
    depositAddress: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', rateUsd: 1.0 },
      { symbol: 'USDC', name: 'USD Coin', rateUsd: 1.0 },
      { symbol: 'BNB', name: 'BNB', rateUsd: 590.0 },
    ],
  },
  {
    id: 'polygon',
    name: 'Polygon',
    badge: 'Polygon PoS',
    eta: '~30 sec',
    feeUsd: 0.4,
    wrongChainWarning: null,
    depositAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    tokens: [
      { symbol: 'USDT', name: 'Tether USD', rateUsd: 1.0 },
      { symbol: 'USDC', name: 'USD Coin', rateUsd: 1.0 },
    ],
  },
  {
    id: 'solana',
    name: 'Solana',
    badge: 'SPL',
    eta: '~15 sec',
    feeUsd: 0.3,
    wrongChainWarning: null,
    depositAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    tokens: [
      { symbol: 'USDC', name: 'USD Coin', rateUsd: 1.0 },
      { symbol: 'USDT', name: 'Tether USD', rateUsd: 1.0 },
    ],
  },
]

function createSeedDatabase() {
  const now = Date.now()
  const day = 86400 * 1000

  return {
    user: {
      id: 'usr-ngozi-01',
      name: 'Ngozi Adebayo',
      businessName: 'Adebayo Fabrics & Tailoring',
      email: 'ngozi@adebayofabrics.ng',
      phone: '+2348034519820',
      city: 'Yaba, Lagos',
      verifiedMerchantId: 'CLK-NG-8842',
      walletAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      walletType: 'Non-custodial Business Wallet (Base)',
      hasPasskey: false,
    },
    balanceUsd: 1185.0,
    kycMode: 'verified', // 'verified' | 'action_required' | 'pending'
    linkedBanks: [
      {
        id: 'bank-gtb',
        bankName: 'Guaranty Trust Bank (GTBank)',
        accountNumber: '0128493021',
        accountName: 'ADEBAYO FABRICS & TAILORING',
      },
      {
        id: 'bank-access',
        bankName: 'Access Bank',
        accountNumber: '0783920144',
        accountName: 'NGOZI ADEBAYO',
      },
    ],
    invoices: [
      {
        id: 'inv-101',
        invoiceNumber: 'INV-2026-101',
        status: 'unpaid',
        customerName: 'Kwame Mensah',
        customerEmail: 'kwame@accrastudio.gh',
        customerPhone: '+233244819200',
        dueDate: new Date(now + 5 * day).toISOString(),
        issuedAt: new Date(now - 1 * day).toISOString(),
        createdAt: new Date(now - 1 * day).toISOString(),
        allowInstalments: false,
        note: 'Wholesale Ankara & Aso-Oke bundle — express courier to Accra.',
        items: [
          { id: 'li-1', description: 'Premium Indigo Adire Yardage (12 yds)', quantity: 2, unitPrice: 85.0 },
          { id: 'li-2', description: 'Handwoven Aso-Oke Trim Set', quantity: 1, unitPrice: 70.0 },
        ],
        discount: null,
        subtotal: 240.0,
        discountAmount: 0,
        total: 240.0,
        amountPaid: 0,
        amountRemaining: 240.0,
        activePaymentId: null,
        replacementInvoiceId: null,
        replacesInvoiceId: 'inv-105',
      },
      {
        id: 'inv-102',
        invoiceNumber: 'INV-2026-102',
        status: 'partial',
        customerName: 'Ama Osei',
        customerEmail: 'ama.osei@kumasibridal.com',
        customerPhone: '+233208114322',
        dueDate: new Date(now + 10 * day).toISOString(),
        issuedAt: new Date(now - 4 * day).toISOString(),
        createdAt: new Date(now - 4 * day).toISOString(),
        allowInstalments: true,
        note: 'Bridal party tailoring order (50% deposit received, balance before dispatch).',
        items: [
          { id: 'li-3', description: 'Custom Bridal Lace Gown Tailoring', quantity: 1, unitPrice: 420.0 },
          { id: 'li-4', description: 'Bridesmaid Gele & Sash Set', quantity: 3, unitPrice: 60.0 },
        ],
        discount: null,
        subtotal: 600.0,
        discountAmount: 0,
        total: 600.0,
        amountPaid: 250.0,
        amountRemaining: 350.0,
        activePaymentId: null,
        replacementInvoiceId: null,
        replacesInvoiceId: null,
      },
      {
        id: 'inv-103',
        invoiceNumber: 'INV-2026-103',
        status: 'overdue',
        customerName: 'Kofi Boateng',
        customerEmail: 'kofi@tematrading.gh',
        customerPhone: '+233542990118',
        dueDate: new Date(now - 6 * day).toISOString(),
        issuedAt: new Date(now - 14 * day).toISOString(),
        createdAt: new Date(now - 14 * day).toISOString(),
        allowInstalments: false,
        note: 'Restock of men kaftan embroidery panels.',
        items: [
          { id: 'li-5', description: 'Embroidered Senator Fabric Cut (4 yds)', quantity: 3, unitPrice: 55.0 },
          { id: 'li-6', description: 'DHL West Africa Waybill', quantity: 1, unitPrice: 20.0 },
        ],
        discount: null,
        subtotal: 185.0,
        discountAmount: 0,
        total: 185.0,
        amountPaid: 0,
        amountRemaining: 185.0,
        activePaymentId: null,
        replacementInvoiceId: null,
        replacesInvoiceId: null,
      },
      {
        id: 'inv-104',
        invoiceNumber: 'INV-2026-104',
        status: 'paid',
        customerName: 'Chidi Okonkwo',
        customerEmail: 'chidi@okonkwoevents.com',
        customerPhone: '+2348091123400',
        dueDate: new Date(now + 2 * day).toISOString(),
        issuedAt: new Date(now - 7 * day).toISOString(),
        createdAt: new Date(now - 7 * day).toISOString(),
        allowInstalments: false,
        note: 'Repeat client loyalty discount applied before issuing.',
        items: [
          { id: 'li-7', description: 'Bespoke Agbada 3-Piece Set', quantity: 2, unitPrice: 225.0 },
        ],
        discount: { type: 'percent', value: 10 },
        subtotal: 450.0,
        discountAmount: 45.0,
        total: 405.0,
        amountPaid: 405.0,
        amountRemaining: 0,
        activePaymentId: null,
        replacementInvoiceId: null,
        replacesInvoiceId: null,
      },
      {
        id: 'inv-107',
        invoiceNumber: 'INV-2026-107',
        status: 'pending',
        customerName: 'Yaw Asante',
        customerEmail: 'yaw@asantecraft.gh',
        customerPhone: '+233267008911',
        dueDate: new Date(now + 4 * day).toISOString(),
        issuedAt: new Date(now - 2 * day).toISOString(),
        createdAt: new Date(now - 2 * day).toISOString(),
        allowInstalments: false,
        note: 'Loom cotton rolls — payment currently confirming.',
        items: [
          { id: 'li-8', description: 'Dyed Cotton Loom Roll (25 yds)', quantity: 4, unitPrice: 80.0 },
        ],
        discount: null,
        subtotal: 320.0,
        discountAmount: 0,
        total: 320.0,
        amountPaid: 0,
        amountRemaining: 320.0,
        activePaymentId: 'pay-207',
        replacementInvoiceId: null,
        replacesInvoiceId: null,
      },
      {
        id: 'inv-106',
        invoiceNumber: 'INV-2026-106',
        status: 'draft',
        customerName: 'Efua Mensah',
        customerEmail: 'efua@takoradiboutique.gh',
        customerPhone: '+233243118744',
        dueDate: new Date(now + 7 * day).toISOString(),
        issuedAt: null,
        createdAt: new Date(now - 3600 * 1000).toISOString(),
        allowInstalments: true,
        note: 'Confirming sleeve measurements before issuing.',
        items: [
          { id: 'li-9', description: 'Silk Kaftan Two-Piece', quantity: 2, unitPrice: 85.0 },
        ],
        discount: { type: 'amount', value: 10 },
        subtotal: 170.0,
        discountAmount: 10.0,
        total: 160.0,
        amountPaid: 0,
        amountRemaining: 160.0,
        activePaymentId: null,
        replacementInvoiceId: null,
        replacesInvoiceId: null,
      },
      {
        id: 'inv-105',
        invoiceNumber: 'INV-2026-105',
        status: 'cancelled',
        customerName: 'Kwame Mensah',
        customerEmail: 'kwame@accrastudio.gh',
        customerPhone: '+233244819200',
        dueDate: new Date(now + 3 * day).toISOString(),
        issuedAt: new Date(now - 3 * day).toISOString(),
        createdAt: new Date(now - 3 * day).toISOString(),
        allowInstalments: false,
        note: 'Original order before updating yardage count.',
        items: [
          { id: 'li-10', description: 'Premium Indigo Adire Yardage (18 yds)', quantity: 2, unitPrice: 155.0 },
        ],
        discount: null,
        subtotal: 310.0,
        discountAmount: 0,
        total: 310.0,
        amountPaid: 0,
        amountRemaining: 0,
        activePaymentId: null,
        replacementInvoiceId: 'inv-101',
        replacesInvoiceId: null,
      },
    ],
    payments: [
      {
        id: 'pay-204',
        invoiceId: 'inv-104',
        invoiceNumber: 'INV-2026-104',
        customerName: 'Chidi Okonkwo',
        status: 'delivered', // waiting_deposit | swapping | delivered | underpaid | overpaid | swap_failed | quote_ended
        slowNetwork: false,
        method: 'qr',
        chain: 'tron',
        chainName: 'Tron',
        chainBadge: 'TRC-20',
        token: 'USDT',
        invoiceAmountUsd: 405.0,
        feeUsd: 1.2,
        totalToSendToken: 406.2,
        totalToSendUsd: 406.2,
        receivedToken: 406.2,
        merchantReceivesUsd: 405.0,
        depositAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        returnAddress: 'TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9',
        returnStatus: 'none', // none | needs_address | returning | returned
        excessTokenAmount: 0,
        shortfallTokenAmount: 0,
        txHashIn: '8f94c31d8a7e09f1b2409f83412ab992c71a43f91b88a77e12c09d443188ef01',
        txHashOut: '0x61b2f8d7291bc091a8840f92174a6621c08d33a91c82b0014d9f128839ab4410',
        quoteExpiresAt: new Date(now - 6 * day).toISOString(),
        quoteDurationSec: 900,
        createdAt: new Date(now - 6 * day - 600000).toISOString(),
        completedAt: new Date(now - 6 * day).toISOString(),
        checkCount: 2,
      },
      {
        id: 'pay-202a',
        invoiceId: 'inv-102',
        invoiceNumber: 'INV-2026-102',
        customerName: 'Ama Osei',
        status: 'delivered',
        slowNetwork: false,
        method: 'wallet',
        chain: 'base',
        chainName: 'Base',
        chainBadge: 'Base L2',
        token: 'USDC',
        invoiceAmountUsd: 250.0,
        feeUsd: 0.35,
        totalToSendToken: 250.35,
        totalToSendUsd: 250.35,
        receivedToken: 250.35,
        merchantReceivesUsd: 250.0,
        depositAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        returnAddress: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        returnStatus: 'none',
        excessTokenAmount: 0,
        shortfallTokenAmount: 0,
        txHashIn: '0x99a1bc402f8129043cd7821ef09a12309bc8817263541abcde00918273645512',
        txHashOut: '0x99a1bc402f8129043cd7821ef09a12309bc8817263541abcde00918273645512',
        quoteExpiresAt: new Date(now - 3 * day).toISOString(),
        quoteDurationSec: 900,
        createdAt: new Date(now - 3 * day - 300000).toISOString(),
        completedAt: new Date(now - 3 * day).toISOString(),
        checkCount: 1,
      },
      {
        id: 'pay-207',
        invoiceId: 'inv-107',
        invoiceNumber: 'INV-2026-107',
        customerName: 'Yaw Asante',
        status: 'swapping',
        slowNetwork: false,
        method: 'qr',
        chain: 'bsc',
        chainName: 'BNB Smart Chain',
        chainBadge: 'BEP-20',
        token: 'USDT',
        invoiceAmountUsd: 320.0,
        feeUsd: 0.5,
        totalToSendToken: 320.5,
        totalToSendUsd: 320.5,
        receivedToken: 320.5,
        merchantReceivesUsd: 320.0,
        depositAddress: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
        returnAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        returnStatus: 'none',
        excessTokenAmount: 0,
        shortfallTokenAmount: 0,
        txHashIn: '0x42e819a0b31f77209c8812d77a0192bc3418f90021aa774129cb81900231df9a',
        txHashOut: null,
        quoteExpiresAt: new Date(now + 600 * 1000).toISOString(),
        quoteDurationSec: 900,
        createdAt: new Date(now - 180 * 1000).toISOString(),
        completedAt: null,
        checkCount: 0,
      },
    ],
    withdrawals: [
      {
        id: 'wd-301',
        amountUsd: 530.0,
        feeUsd: 2.5,
        totalLeavingWalletUsd: 532.5,
        rateNgnPerUsd: 1620.0,
        expectedNgn: 858600.0,
        destinationBank: {
          id: 'bank-gtb',
          bankName: 'Guaranty Trust Bank (GTBank)',
          accountNumber: '0128493021',
          accountName: 'ADEBAYO FABRICS & TAILORING',
        },
        status: 'Paid to your bank',
        stoppedAt: null,
        failureExplanation: null,
        fundsReturnedToWallet: false,
        nextActionLabel: null,
        createdAt: new Date(now - 5 * day).toISOString(),
        updatedAt: new Date(now - 5 * day + 420000).toISOString(),
        pollStep: 4,
      },
    ],
  }
}

export function getMockOverrides() {
  if (typeof window === 'undefined') {
    return { screenState: 'normal', payEdgeState: 'none', withdrawalMode: 'normal', kycMode: 'verified' }
  }
  try {
    const raw = window.sessionStorage.getItem(MOCK_MODE_KEY)
    if (!raw) {
      return { screenState: 'normal', payEdgeState: 'none', withdrawalMode: 'normal', kycMode: 'verified' }
    }
    return {
      screenState: 'normal',
      payEdgeState: 'none',
      withdrawalMode: 'normal',
      kycMode: 'verified',
      ...JSON.parse(raw),
    }
  } catch {
    return { screenState: 'normal', payEdgeState: 'none', withdrawalMode: 'normal', kycMode: 'verified' }
  }
}

export function setMockOverrides(patch) {
  if (typeof window === 'undefined') return
  const next = { ...getMockOverrides(), ...patch }
  window.sessionStorage.setItem(MOCK_MODE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('clikpa-mock-change', { detail: next }))
}

export function resetMockDatabase() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(MOCK_STORAGE_KEY)
  window.sessionStorage.removeItem(MOCK_MODE_KEY)
  window.dispatchEvent(new CustomEvent('clikpa-mock-change', { detail: getMockOverrides() }))
}

function loadDb() {
  if (typeof window === 'undefined') return createSeedDatabase()
  try {
    const raw = window.sessionStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) {
      const seed = createSeedDatabase()
      window.sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  } catch {
    return createSeedDatabase()
  }
}

function saveDb(db) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Ignore storage quota errors
  }
}

function delay(ms = 240) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeError(code, message, retryable = true, status = 400) {
  const err = new Error(message)
  err.code = code
  err.message = message
  err.retryable = retryable
  err.status = status
  return err
}

function computeInvoiceStatus(invoice) {
  if (invoice.status === 'cancelled' || invoice.status === 'draft') {
    return invoice.status
  }
  if (invoice.amountRemaining <= 0.004 && invoice.total > 0) {
    return 'paid'
  }
  if (invoice.activePaymentId) {
    return 'pending'
  }
  if (invoice.amountPaid > 0 && invoice.amountRemaining > 0) {
    return 'partial'
  }
  // Rule 3: Passing the due date makes an invoice "Overdue" — NEVER "expired".
  if (invoice.dueDate && new Date(invoice.dueDate).getTime() < Date.now()) {
    return 'overdue'
  }
  return 'unpaid'
}

function decoratePublicInvoice(invoice, db) {
  const status = computeInvoiceStatus(invoice)
  const relatedPayments = db.payments
    .filter((p) => p.invoiceId === invoice.id && p.status === 'delivered')
    .map((p) => ({
      id: p.id,
      amountUsd: p.merchantReceivesUsd,
      token: p.token,
      chainName: p.chainName,
      completedAt: p.completedAt,
    }))

  return {
    ...invoice,
    status,
    merchant: {
      businessName: db.user.businessName,
      city: db.user.city,
      verifiedMerchantId: db.user.verifiedMerchantId,
    },
    networks: SUPPORTED_NETWORKS,
    completedPayments: relatedPayments,
  }
}

function applyPayEdgeOverride(payment, overrideEdge) {
  if (!payment || !overrideEdge || overrideEdge === 'none') return payment
  const copy = { ...payment }
  if (overrideEdge === 'quote_ended') {
    copy.status = 'waiting_deposit'
    copy.quoteExpiresAt = new Date(Date.now() - 5000).toISOString()
  } else if (overrideEdge === 'underpaid') {
    copy.status = 'underpaid'
    const sent = Number((copy.totalToSendToken * 0.75).toFixed(2))
    copy.receivedToken = sent
    copy.shortfallTokenAmount = Number((copy.totalToSendToken - sent).toFixed(2))
  } else if (overrideEdge === 'overpaid_returning') {
    copy.status = 'overpaid'
    const excess = 25.0
    copy.receivedToken = Number((copy.totalToSendToken + excess).toFixed(2))
    copy.excessTokenAmount = excess
    copy.returnStatus = copy.returnAddress ? 'returning' : 'needs_address'
  } else if (overrideEdge === 'overpaid_returned') {
    copy.status = 'overpaid'
    const excess = 25.0
    copy.receivedToken = Number((copy.totalToSendToken + excess).toFixed(2))
    copy.excessTokenAmount = excess
    copy.returnAddress = copy.returnAddress || 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'
    copy.returnStatus = 'returned'
    copy.returnTxHash = '91ab72fe0019c834d211fa98002bc7319d88412ef0192837465ab91827364501'
  } else if (overrideEdge === 'swap_failed') {
    copy.status = 'swap_failed'
    copy.receivedToken = copy.totalToSendToken
    copy.returnStatus = copy.returnAddress ? 'returning' : 'needs_address'
  } else if (overrideEdge === 'slow_network') {
    copy.status = 'swapping'
    copy.slowNetwork = true
  }
  return copy
}

export async function handleMockRequest(method, path, body = null) {
  const overrides = getMockOverrides()

  if (overrides.screenState === 'loading') {
    await delay(2600)
  } else {
    await delay(220)
  }

  if (overrides.screenState === 'error' && !path.startsWith('/auth')) {
    throw makeError(
      'NETWORK_UNAVAILABLE',
      'We could not reach ClikPa right now. Any payment or balance already confirmed is safe.',
      true,
      503,
    )
  }

  const db = loadDb()
  const cleanPath = path.split('?')[0]

  // --- AUTH ---
  if (method === 'POST' && cleanPath === '/auth/request-code') {
    if (!body?.email || !String(body.email).includes('@')) {
      throw makeError('INVALID_EMAIL', 'Enter a valid business email address so we can send your sign-in code.', false, 400)
    }
    return {
      sentTo: body.email,
      expiresInSec: 600,
      demoHint: 'Enter any 6-digit code (for example 123456) in mock mode.',
    }
  }

  if (method === 'POST' && cleanPath === '/auth/verify-code') {
    const code = String(body?.code || '').trim()
    if (code.length < 4) {
      throw makeError('INVALID_CODE', 'That code does not match. Check the 6-digit code in your email and try again.', true, 400)
    }
    if (body?.email) {
      db.user.email = body.email
      saveDb(db)
    }
    return {
      token: 'mock_jwt_clikpa_merchant_ngozi',
      user: db.user,
    }
  }

  if (method === 'POST' && cleanPath === '/auth/login') {
    if (!body?.email || !body?.password || String(body.password).length < 4) {
      throw makeError('INVALID_CREDENTIALS', 'Check your email and password, then try signing in again.', true, 401)
    }
    db.user.email = body.email
    saveDb(db)
    return {
      token: 'mock_jwt_clikpa_merchant_ngozi',
      user: db.user,
    }
  }

  if (method === 'POST' && cleanPath === '/auth/wallet') {
    return {
      token: 'mock_jwt_clikpa_merchant_ngozi',
      user: {
        ...db.user,
        walletAddress: body?.walletAddress || db.user.walletAddress,
      },
    }
  }

  // --- PROFILE & MERCHANT WALLET ---
  if (method === 'GET' && cleanPath === '/me') {
    return db.user
  }

  if (method === 'PATCH' && cleanPath === '/me') {
    db.user = { ...db.user, ...body }
    saveDb(db)
    return db.user
  }

  if (method === 'GET' && cleanPath === '/balance') {
    if (overrides.screenState === 'empty') {
      return {
        availableUsd: 0,
        pendingUsd: 0,
        currency: 'USDC',
        walletAddress: db.user.walletAddress,
        walletType: db.user.walletType,
      }
    }
    const pendingUsd = db.invoices
      .filter((i) => computeInvoiceStatus(i) === 'pending')
      .reduce((sum, i) => sum + i.amountRemaining, 0)
    return {
      availableUsd: db.balanceUsd,
      pendingUsd,
      currency: 'USDC',
      walletAddress: db.user.walletAddress,
      walletType: db.user.walletType,
    }
  }

  if (method === 'GET' && cleanPath === '/payments') {
    if (overrides.screenState === 'empty') return { payments: [], withdrawals: [] }
    return {
      payments: db.payments.filter((p) => p.status === 'delivered' || p.status === 'swapping'),
      withdrawals: db.withdrawals,
    }
  }

  // --- MERCHANT INVOICES ---
  if (method === 'GET' && cleanPath === '/invoices') {
    if (overrides.screenState === 'empty') return { invoices: [] }
    const list = db.invoices.map((inv) => ({
      ...inv,
      status: computeInvoiceStatus(inv),
    }))
    return { invoices: list }
  }

  if (method === 'POST' && cleanPath === '/invoices') {
    const items = (body?.items || []).map((it, idx) => ({
      id: it.id || `li-${Date.now()}-${idx}`,
      description: String(it.description || '').trim(),
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
    }))
    const discount =
      body?.discount && Number(body.discount.value) > 0
        ? { type: body.discount.type === 'percent' ? 'percent' : 'amount', value: Number(body.discount.value) }
        : null
    const totals = calculateInvoiceTotals(items, discount)
    const nextNum = 108 + db.invoices.length
    const draft = {
      id: `inv-${nextNum}`,
      invoiceNumber: `INV-2026-${nextNum}`,
      status: 'draft',
      customerName: String(body?.customerName || '').trim(),
      customerEmail: String(body?.customerEmail || '').trim(),
      customerPhone: String(body?.customerPhone || '').trim(),
      dueDate: body?.dueDate || new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      issuedAt: null,
      createdAt: new Date().toISOString(),
      allowInstalments: Boolean(body?.allowInstalments),
      note: String(body?.note || '').trim(),
      items,
      discount,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      total: totals.total,
      amountPaid: 0,
      amountRemaining: totals.total,
      activePaymentId: null,
      replacementInvoiceId: null,
      replacesInvoiceId: body?.replacesInvoiceId || null,
    }
    db.invoices.unshift(draft)
    saveDb(db)
    return draft
  }

  const patchInvoiceMatch = cleanPath.match(/^\/invoices\/([^/]+)$/)
  if (patchInvoiceMatch && method === 'GET') {
    const id = decodeURIComponent(patchInvoiceMatch[1])
    if (overrides.screenState === 'empty') {
      throw makeError('NOT_FOUND', 'We could not find that invoice.', false, 404)
    }
    const inv = db.invoices.find((i) => i.id === id)
    if (!inv) {
      throw makeError('NOT_FOUND', 'We could not find that invoice in your account.', false, 404)
    }
    const invPayments = db.payments.filter((p) => p.invoiceId === inv.id)
    return {
      ...inv,
      status: computeInvoiceStatus(inv),
      payments: invPayments,
    }
  }

  if (patchInvoiceMatch && method === 'PATCH') {
    const id = decodeURIComponent(patchInvoiceMatch[1])
    const idx = db.invoices.findIndex((i) => i.id === id)
    if (idx === -1) throw makeError('NOT_FOUND', 'Invoice not found.', false, 404)
    const existing = db.invoices[idx]
    // Rule 4: Only drafts are editable. Issued invoices cannot be edited.
    if (existing.status !== 'draft') {
      throw makeError(
        'INVOICE_LOCKED',
        'Issued invoices cannot be edited. Use Cancel and replace if no payment has started.',
        false,
        400,
      )
    }
    const items = (body?.items || existing.items).map((it, i) => ({
      id: it.id || `li-${Date.now()}-${i}`,
      description: String(it.description || '').trim(),
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
    }))
    const discount =
      body?.discount !== undefined
        ? body.discount && Number(body.discount.value) > 0
          ? { type: body.discount.type === 'percent' ? 'percent' : 'amount', value: Number(body.discount.value) }
          : null
        : existing.discount
    const totals = calculateInvoiceTotals(items, discount)
    const updated = {
      ...existing,
      customerName: body?.customerName !== undefined ? String(body.customerName).trim() : existing.customerName,
      customerEmail: body?.customerEmail !== undefined ? String(body.customerEmail).trim() : existing.customerEmail,
      customerPhone: body?.customerPhone !== undefined ? String(body.customerPhone).trim() : existing.customerPhone,
      dueDate: body?.dueDate !== undefined ? body.dueDate : existing.dueDate,
      allowInstalments:
        body?.allowInstalments !== undefined ? Boolean(body.allowInstalments) : existing.allowInstalments,
      note: body?.note !== undefined ? String(body.note).trim() : existing.note,
      items,
      discount,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      total: totals.total,
      amountRemaining: totals.total,
    }
    db.invoices[idx] = updated
    saveDb(db)
    return updated
  }

  const issueMatch = cleanPath.match(/^\/invoices\/([^/]+)\/issue$/)
  if (issueMatch && method === 'POST') {
    const id = decodeURIComponent(issueMatch[1])
    const inv = db.invoices.find((i) => i.id === id)
    if (!inv) throw makeError('NOT_FOUND', 'Invoice not found.', false, 404)
    if (inv.total <= 0) {
      throw makeError('INVALID_TOTAL', 'Invoice total must be greater than $0.00 before issuing.', false, 400)
    }
    inv.status = 'unpaid'
    inv.issuedAt = new Date().toISOString()
    inv.status = computeInvoiceStatus(inv)
    saveDb(db)
    return inv
  }

  const cancelReplaceMatch = cleanPath.match(/^\/invoices\/([^/]+)\/cancel-replace$/)
  if (cancelReplaceMatch && method === 'POST') {
    const id = decodeURIComponent(cancelReplaceMatch[1])
    const inv = db.invoices.find((i) => i.id === id)
    if (!inv) throw makeError('NOT_FOUND', 'Invoice not found.', false, 404)
    const currentStatus = computeInvoiceStatus(inv)
    // Rule 4: Cannot cancel once a payment is underway or received.
    if (currentStatus === 'pending' || inv.amountPaid > 0 || currentStatus === 'paid' || currentStatus === 'partial') {
      throw makeError(
        'CANNOT_CANCEL',
        'This invoice cannot be cancelled because a payment is already underway or has been received.',
        false,
        400,
      )
    }
    const nextNum = 108 + db.invoices.length
    const replacement = {
      ...inv,
      id: `inv-${nextNum}`,
      invoiceNumber: `INV-2026-${nextNum}`,
      status: 'draft',
      issuedAt: null,
      createdAt: new Date().toISOString(),
      amountPaid: 0,
      amountRemaining: inv.total,
      activePaymentId: null,
      replacementInvoiceId: null,
      replacesInvoiceId: inv.id,
    }
    inv.status = 'cancelled'
    inv.amountRemaining = 0
    inv.replacementInvoiceId = replacement.id
    db.invoices.unshift(replacement)
    saveDb(db)
    return {
      cancelledInvoice: inv,
      replacementInvoice: replacement,
    }
  }

  // --- PUBLIC PAY & RECEIPTS ---
  const pubInvMatch = cleanPath.match(/^\/public\/invoices\/([^/]+)$/)
  if (pubInvMatch && method === 'GET') {
    const id = decodeURIComponent(pubInvMatch[1])
    if (overrides.screenState === 'empty') {
      throw makeError('INVOICE_NOT_FOUND', 'No invoice exists at this payment link. Check the link with the merchant.', false, 404)
    }
    const inv = db.invoices.find((i) => i.id === id)
    if (!inv) {
      throw makeError('INVOICE_NOT_FOUND', 'We could not find an invoice for this link. Ask the business to share the link again.', false, 404)
    }
    return decoratePublicInvoice(inv, db)
  }

  const createPayMatch = cleanPath.match(/^\/public\/invoices\/([^/]+)\/payments$/)
  if (createPayMatch && method === 'POST') {
    const id = decodeURIComponent(createPayMatch[1])
    const inv = db.invoices.find((i) => i.id === id)
    if (!inv) throw makeError('INVOICE_NOT_FOUND', 'Invoice not found.', false, 404)
    const currentStatus = computeInvoiceStatus(inv)
    if (currentStatus === 'draft') {
      throw makeError('INVOICE_DRAFT', 'This invoice is still a draft and cannot be paid yet.', false, 400)
    }
    if (currentStatus === 'cancelled') {
      throw makeError('INVOICE_CANCELLED', 'This invoice was cancelled by the merchant.', false, 400)
    }
    if (currentStatus === 'paid') {
      throw makeError('INVOICE_ALREADY_PAID', 'This invoice has already been paid in full.', false, 400)
    }

    const requestedAmountUsd =
      inv.allowInstalments && body?.amount !== undefined ? Number(body.amount) : Number(inv.amountRemaining)

    // Rule 7: Block amounts above remaining balance
    if (!Number.isFinite(requestedAmountUsd) || requestedAmountUsd <= 0) {
      throw makeError('INVALID_AMOUNT', 'Enter a payment amount greater than $0.00.', false, 400)
    }
    if (requestedAmountUsd > inv.amountRemaining + 0.004) {
      throw makeError(
        'EXCEEDS_BALANCE',
        `Enter an amount up to $${inv.amountRemaining.toFixed(2)}, which is the remaining balance.`,
        false,
        400,
      )
    }

    const net = SUPPORTED_NETWORKS.find((n) => n.id === body?.chain) || SUPPORTED_NETWORKS[0]
    const tok = net.tokens.find((t) => t.symbol === body?.token) || net.tokens[0]
    const feeUsd = net.feeUsd
    const totalUsd = Number((requestedAmountUsd + feeUsd).toFixed(2))
    const totalToken =
      tok.rateUsd === 1
        ? totalUsd
        : Number((totalUsd / tok.rateUsd).toFixed(5))

    const existingActive = inv.activePaymentId ? db.payments.find((p) => p.id === inv.activePaymentId) : null
    if (
      existingActive &&
      existingActive.status === 'waiting_deposit' &&
      !body?.refreshQuote &&
      existingActive.chain === net.id &&
      existingActive.token === tok.symbol &&
      Math.abs(existingActive.invoiceAmountUsd - requestedAmountUsd) < 0.01
    ) {
      if (body?.returnAddress) {
        existingActive.returnAddress = body.returnAddress
        saveDb(db)
      }
      return applyPayEdgeOverride(existingActive, overrides.payEdgeState)
    }

    const paymentId = `pay-${Date.now().toString(36)}`
    const quoteDurationSec = 900
    const payment = {
      id: paymentId,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      status: 'waiting_deposit',
      slowNetwork: false,
      method: body?.method === 'wallet' ? 'wallet' : 'qr',
      chain: net.id,
      chainName: net.name,
      chainBadge: net.badge,
      token: tok.symbol,
      invoiceAmountUsd: Number(requestedAmountUsd.toFixed(2)),
      feeUsd,
      totalToSendUsd: totalUsd,
      totalToSendToken: totalToken,
      receivedToken: 0,
      merchantReceivesUsd: Number(requestedAmountUsd.toFixed(2)),
      depositAddress: net.depositAddress,
      returnAddress: body?.returnAddress ? String(body.returnAddress).trim() : '',
      returnStatus: 'none',
      excessTokenAmount: 0,
      shortfallTokenAmount: 0,
      txHashIn: null,
      txHashOut: null,
      quoteExpiresAt: new Date(Date.now() + quoteDurationSec * 1000).toISOString(),
      quoteDurationSec,
      createdAt: new Date().toISOString(),
      completedAt: null,
      checkCount: 0,
    }

    db.payments.unshift(payment)
    saveDb(db)
    return applyPayEdgeOverride(payment, overrides.payEdgeState)
  }

  const getPayMatch = cleanPath.match(/^\/public\/payments\/([^/]+)$/)
  if (getPayMatch && method === 'GET') {
    const paymentId = decodeURIComponent(getPayMatch[1])
    const payment = db.payments.find((p) => p.id === paymentId)
    if (!payment) {
      throw makeError('PAYMENT_NOT_FOUND', 'We could not find those payment details. You can generate fresh details below.', true, 404)
    }
    if (
      payment.status === 'waiting_deposit' &&
      new Date(payment.quoteExpiresAt).getTime() <= Date.now()
    ) {
      payment.status = 'quote_ended'
      saveDb(db)
    }
    return applyPayEdgeOverride(payment, overrides.payEdgeState)
  }

  const checkPayMatch = cleanPath.match(/^\/public\/payments\/([^/]+)\/check$/)
  if (checkPayMatch && method === 'POST') {
    const paymentId = decodeURIComponent(checkPayMatch[1])
    const payment = db.payments.find((p) => p.id === paymentId)
    if (!payment) {
      throw makeError('PAYMENT_NOT_FOUND', 'Payment details not found.', true, 404)
    }

    if (body?.returnAddress) {
      payment.returnAddress = String(body.returnAddress).trim()
      if (payment.returnStatus === 'needs_address') {
        payment.returnStatus = 'returning'
      }
      saveDb(db)
    }

    if (overrides.payEdgeState !== 'none') {
      return applyPayEdgeOverride(payment, overrides.payEdgeState)
    }

    // Rule 6: Status transitions happen ONLY on the server/API response, never forced on the client.
    payment.checkCount = (payment.checkCount || 0) + 1
    const inv = db.invoices.find((i) => i.id === payment.invoiceId)

    if (payment.status === 'waiting_deposit') {
      payment.status = 'swapping'
      payment.receivedToken = payment.totalToSendToken
      payment.txHashIn = `0x${payment.id.replace(/[^a-f0-9]/gi, 'a').padEnd(16, '8')}f49281bc730192837465ab9182736450192837465ab91827`
      if (inv) {
        inv.activePaymentId = payment.id
        inv.status = computeInvoiceStatus(inv)
      }
    } else if (payment.status === 'swapping') {
      payment.status = 'delivered'
      payment.completedAt = new Date().toISOString()
      payment.txHashOut = `0x77c9${payment.id.replace(/[^a-f0-9]/gi, 'b').padEnd(14, '4')}d1029384756ab9182736450192837465ab9182736450`
      if (inv) {
        inv.activePaymentId = null
        inv.amountPaid = Number((inv.amountPaid + payment.merchantReceivesUsd).toFixed(2))
        inv.amountRemaining = Math.max(0, Number((inv.total - inv.amountPaid).toFixed(2)))
        inv.status = computeInvoiceStatus(inv)
        db.balanceUsd = Number((db.balanceUsd + payment.merchantReceivesUsd).toFixed(2))
      }
    }

    saveDb(db)
    return payment
  }

  const receiptMatch = cleanPath.match(/^\/public\/receipts\/([^/]+)$/)
  if (receiptMatch && method === 'GET') {
    const idOrInvoiceId = decodeURIComponent(receiptMatch[1])
    if (overrides.screenState === 'empty') {
      throw makeError('RECEIPT_NOT_FOUND', 'No payment receipt was found for this reference yet.', false, 404)
    }
    let payment = db.payments.find((p) => p.id === idOrInvoiceId && p.status === 'delivered')
    let invoice = payment
      ? db.invoices.find((i) => i.id === payment.invoiceId)
      : db.invoices.find((i) => i.id === idOrInvoiceId)

    if (!payment && invoice) {
      const deliveredForInvoice = db.payments.filter(
        (p) => p.invoiceId === invoice.id && p.status === 'delivered',
      )
      payment = deliveredForInvoice[0] || null
    }

    if (!invoice) {
      throw makeError('RECEIPT_NOT_FOUND', 'We could not find a receipt for this link.', false, 404)
    }

    const allReceiptsForInvoice = db.payments
      .filter((p) => p.invoiceId === invoice.id && p.status === 'delivered')
      .map((p, index) => ({
        paymentId: p.id,
        receiptNumber: `RCP-${invoice.invoiceNumber.replace('INV-', '')}-${index + 1}`,
        paidAt: p.completedAt,
        invoiceAmountUsd: p.invoiceAmountUsd,
        feeUsd: p.feeUsd,
        totalSentToken: p.totalToSendToken,
        token: p.token,
        chainName: p.chainName,
        chainBadge: p.chainBadge,
        txHashIn: p.txHashIn,
        txHashOut: p.txHashOut,
      }))

    return {
      invoice: {
        ...invoice,
        status: computeInvoiceStatus(invoice),
      },
      merchant: {
        businessName: db.user.businessName,
        city: db.user.city,
        email: db.user.email,
        verifiedMerchantId: db.user.verifiedMerchantId,
      },
      activeReceipt: payment
        ? allReceiptsForInvoice.find((r) => r.paymentId === payment.id) || allReceiptsForInvoice[0]
        : allReceiptsForInvoice[0] || null,
      receipts: allReceiptsForInvoice,
    }
  }

  // --- WITHDRAWALS ---
  if (method === 'GET' && cleanPath === '/withdrawals/options') {
    if (overrides.screenState === 'empty') {
      return {
        availableUsd: 0,
        partnerName: 'Paycrest Regulated Naira Payouts',
        rateNgnPerUsd: 1625.0,
        minAmountUsd: 10,
        maxAmountUsd: 5000,
        flatFeeUsd: 1.5,
        percentFee: 0.5,
        kycStatus: 'action_required',
        partnerSteps: [
          {
            id: 'partner-kyc-bvn',
            type: 'identity',
            title: 'Verify your identity with our payout partner',
            description:
              'Nigerian banking rules require a one-time partner check before your first naira withdrawal.',
            fields: [
              { name: 'idType', label: 'Document type', placeholder: 'NIN or BVN (handled by payout partner)' },
              { name: 'idNumber', label: '11-digit number', placeholder: 'Enter 11 digits' },
            ],
            actionLabel: 'Submit to payout partner',
          },
        ],
        linkedBanks: [],
        supportedBanks: [
          'Guaranty Trust Bank (GTBank)',
          'Access Bank',
          'Zenith Bank',
          'United Bank for Africa (UBA)',
          'First Bank of Nigeria',
          'Kuda Microfinance Bank',
          'Moniepoint MFB',
        ],
      }
    }

    const kycMode = overrides.kycMode || db.kycMode || 'verified'
    const partnerSteps =
      kycMode === 'action_required'
        ? [
            {
              id: 'partner-kyc-bvn',
              type: 'identity',
              title: 'Verify your identity with our payout partner',
              description:
                'Required once by our licensed Nigerian payout partner before sending naira to your bank.',
              fields: [
                { name: 'idType', label: 'Verification type', placeholder: 'NIN or BVN' },
                { name: 'idNumber', label: 'Identification number', placeholder: 'Enter 11 digits' },
              ],
              actionLabel: 'Complete partner verification',
            },
          ]
        : kycMode === 'pending'
          ? [
              {
                id: 'partner-kyc-pending',
                type: 'status',
                title: 'Partner identity check in progress',
                description:
                  'Our payout partner is reviewing your details. This usually takes under 5 minutes.',
                fields: [],
                actionLabel: 'Refresh verification status',
              },
            ]
          : []

    return {
      availableUsd: db.balanceUsd,
      partnerName: 'Paycrest Regulated Naira Payouts',
      rateNgnPerUsd: 1625.0,
      minAmountUsd: 10,
      maxAmountUsd: 5000,
      flatFeeUsd: 1.5,
      percentFee: 0.5,
      kycStatus: kycMode,
      partnerSteps,
      linkedBanks: db.linkedBanks,
      supportedBanks: [
        'Guaranty Trust Bank (GTBank)',
        'Access Bank',
        'Zenith Bank',
        'United Bank for Africa (UBA)',
        'First Bank of Nigeria',
        'Kuda Microfinance Bank',
        'Moniepoint MFB',
      ],
    }
  }

  if (method === 'POST' && cleanPath === '/withdrawals/quote') {
    if (body?.partnerAction === 'complete_kyc') {
      db.kycMode = 'verified'
      setMockOverrides({ kycMode: 'verified' })
      saveDb(db)
      return { kycStatus: 'verified' }
    }
    if (body?.partnerAction === 'link_bank') {
      const acct = String(body.accountNumber || '').replace(/\D/g, '')
      if (acct.length !== 10) {
        throw makeError('INVALID_NUBAN', 'Enter a valid 10-digit Nigerian NUBAN account number.', false, 400)
      }
      const newBank = {
        id: `bank-${Date.now()}`,
        bankName: body.bankName || 'Zenith Bank',
        accountNumber: acct,
        accountName: String(body.accountName || db.user.businessName).toUpperCase(),
      }
      db.linkedBanks.push(newBank)
      saveDb(db)
      return { linkedBank: newBank }
    }

    const amountUsd = Number(body?.amountUsd || 0)
    if (!Number.isFinite(amountUsd) || amountUsd < 10) {
      throw makeError('MIN_WITHDRAWAL', 'Minimum withdrawal is $10.00.', false, 400)
    }
    const feeUsd = Number((1.5 + amountUsd * 0.005).toFixed(2))
    const totalLeavingWalletUsd = Number((amountUsd + feeUsd).toFixed(2))
    if (totalLeavingWalletUsd > db.balanceUsd) {
      throw makeError(
        'INSUFFICIENT_BALANCE',
        `Total leaving your wallet ($${totalLeavingWalletUsd.toFixed(2)} including charges) is higher than your $${db.balanceUsd.toFixed(2)} balance.`,
        false,
        400,
      )
    }
    const bank = db.linkedBanks.find((b) => b.id === body?.bankId) || db.linkedBanks[0]
    if (!bank) {
      throw makeError('NO_BANK', 'Link a Nigerian bank account first so we know where to send your naira.', false, 400)
    }
    const rateNgnPerUsd = 1625.0
    const expectedNgn = Number((amountUsd * rateNgnPerUsd).toFixed(2))
    return {
      quoteId: `wq-${Date.now()}`,
      amountUsd: Number(amountUsd.toFixed(2)),
      feeUsd,
      totalLeavingWalletUsd,
      rateNgnPerUsd,
      expectedNgn,
      destinationBank: bank,
      expiresAt: new Date(Date.now() + 180 * 1000).toISOString(),
    }
  }

  if (method === 'POST' && cleanPath === '/withdrawals') {
    const amountUsd = Number(body?.amountUsd || 0)
    const feeUsd = Number((1.5 + amountUsd * 0.005).toFixed(2))
    const totalLeavingWalletUsd = Number((amountUsd + feeUsd).toFixed(2))
    const bank = db.linkedBanks.find((b) => b.id === body?.bankId) || db.linkedBanks[0]
    const rateNgnPerUsd = 1625.0
    const expectedNgn = Number((amountUsd * rateNgnPerUsd).toFixed(2))

    // Rule 9: Exact API-reported statuses starting at "Awaiting approval"
    const wd = {
      id: `wd-${Date.now().toString(36)}`,
      amountUsd,
      feeUsd,
      totalLeavingWalletUsd,
      rateNgnPerUsd,
      expectedNgn,
      destinationBank: bank,
      status: 'Awaiting approval',
      stoppedAt: null,
      failureExplanation: null,
      fundsReturnedToWallet: false,
      nextActionLabel: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pollStep: 0,
    }
    db.withdrawals.unshift(wd)
    saveDb(db)
    return wd
  }

  const getWdMatch = cleanPath.match(/^\/withdrawals\/([^/]+)$/)
  if (getWdMatch && method === 'GET') {
    const id = decodeURIComponent(getWdMatch[1])
    const wd = db.withdrawals.find((w) => w.id === id)
    if (!wd) throw makeError('WITHDRAWAL_NOT_FOUND', 'Withdrawal record not found.', true, 404)

    const shouldFail = overrides.withdrawalMode === 'fail_bank'
    const shouldConfirmReturn = overrides.withdrawalMode === 'fail_returned'

    if (wd.status !== 'Paid to your bank' && wd.status !== 'Failed') {
      wd.pollStep = (wd.pollStep || 0) + 1
      if (wd.pollStep === 1) {
        wd.status = 'Sending payment'
        db.balanceUsd = Math.max(0, Number((db.balanceUsd - wd.totalLeavingWalletUsd).toFixed(2)))
      } else if (wd.pollStep === 2) {
        wd.status = 'Bank payout processing'
      } else if (wd.pollStep >= 3) {
        if (shouldFail || shouldConfirmReturn) {
          wd.status = 'Failed'
          wd.stoppedAt = 'Bank payout processing'
          wd.failureExplanation =
            'The receiving bank rejected the instant NIBSS transfer due to temporary bank maintenance.'
          wd.fundsReturnedToWallet = shouldConfirmReturn
          if (shouldConfirmReturn) {
            db.balanceUsd = Number((db.balanceUsd + wd.totalLeavingWalletUsd).toFixed(2))
          }
          wd.nextActionLabel = shouldConfirmReturn
            ? 'Start a new withdrawal'
            : 'Check return status'
        } else {
          wd.status = 'Paid to your bank'
        }
      }
      wd.updatedAt = new Date().toISOString()
      saveDb(db)
    } else if (wd.status === 'Failed' && shouldConfirmReturn && !wd.fundsReturnedToWallet) {
      wd.fundsReturnedToWallet = true
      wd.nextActionLabel = 'Start a new withdrawal'
      db.balanceUsd = Number((db.balanceUsd + wd.totalLeavingWalletUsd).toFixed(2))
      wd.updatedAt = new Date().toISOString()
      saveDb(db)
    }

    return wd
  }

  throw makeError('NOT_IMPLEMENTED', 'This action is not available right now.', false, 404)
}
