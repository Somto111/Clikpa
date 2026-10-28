import { Banner } from '../ui'

// Rule 4: Old link shows "Cancelled" and points to the replacement invoice.
export function InvoiceCancelledState({ businessName, replacementInvoiceId }) {
  return (
    <Banner
      variant="warning"
      title="This invoice has been cancelled"
      reassurance="Do not send funds to any old payment details from this link — your money stays safe in your wallet."
      actionLabel={replacementInvoiceId ? 'Open updated invoice' : 'Return to ClikPa'}
      actionTo={replacementInvoiceId ? `/pay/${replacementInvoiceId}` : '/'}
    >
      {replacementInvoiceId
        ? `${businessName} cancelled this invoice and issued an updated replacement invoice for your order.`
        : `${businessName} cancelled this invoice. Contact them directly if you still expect a bill.`}
    </Banner>
  )
}
