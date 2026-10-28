import { cn } from '../utils/cn'

export function Icon({ name, className }) {
  const base = cn('inline-block h-5 w-5 shrink-0', className)

  switch (name) {
    case 'check-circle':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M6.8 10.2l2.1 2.1 4.4-4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 6v4.2l2.8 1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'alert':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M10 3.2L17.6 16.5H2.4L10 3.2z" strokeLinejoin="round" />
          <path d="M10 8.2v3.6M10 14.3h.01" strokeLinecap="round" />
        </svg>
      )
    case 'x-circle':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" />
        </svg>
      )
    case 'half-circle':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 2.5a7.5 7.5 0 010 15V2.5z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'doc':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <rect x="4" y="2.8" width="12" height="14.4" rx="2" />
          <path d="M7 7h6M7 10.2h6M7 13.4h4" strokeLinecap="round" />
        </svg>
      )
    case 'copy':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <rect x="7" y="7" width="9.5" height="9.5" rx="1.8" />
          <path d="M13 7V5.3A1.8 1.8 0 0011.2 3.5H5.3A1.8 1.8 0 003.5 5.3v5.9A1.8 1.8 0 005.3 13H7" />
        </svg>
      )
    case 'qr':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <rect x="3" y="3" width="5.5" height="5.5" rx="1" />
          <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" />
          <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" />
          <path d="M11.5 11.5h2.5v2.5h-2.5zM14.5 14.5H17V17h-2.5zM14.5 11.5H17" strokeLinecap="round" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M10 2.6l6.2 2.4v4.6c0 4.1-2.6 6.8-6.2 8-3.6-1.2-6.2-3.9-6.2-8V5L10 2.6z" strokeLinejoin="round" />
          <path d="M7.3 10.1l1.8 1.8 3.6-3.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <rect x="2.8" y="4.5" width="14.4" height="11.5" rx="2.2" />
          <path d="M13 10.2h4.2" strokeLinecap="round" />
          <circle cx="13.2" cy="10.2" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'bank':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M2.5 8L10 3.2 17.5 8H2.5z" strokeLinejoin="round" />
          <path d="M4.8 8v6.2M8.3 8v6.2M11.7 8v6.2M15.2 8v6.2M2.5 16.5h15" strokeLinecap="round" />
        </svg>
      )
    case 'refresh':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M16.2 10a6.2 6.2 0 11-1.6-4.2M16.2 3.8v2.8h-2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <circle cx="14.5" cy="4.8" r="2.2" />
          <circle cx="5.2" cy="10" r="2.2" />
          <circle cx="14.5" cy="15.2" r="2.2" />
          <path d="M7.2 8.9l5.3-3M7.2 11.1l5.3 3" strokeLinecap="round" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path
            d="M10 3a7 7 0 00-6 10.6L3 17l3.6-.9A7 7 0 1010 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M7.6 7.8c.3 1.8 1.9 3.4 3.8 3.9l1.1-.8c.2-.2.5-.2.8 0l1.1.7" strokeLinecap="round" />
        </svg>
      )
    case 'mail':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <rect x="2.8" y="4.5" width="14.4" height="11" rx="1.8" />
          <path d="M3.5 5.5L10 10.4l6.5-4.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'print':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M6 6.5V3.5h8v3M5.5 14H3.5V8.5a2 2 0 012-2h9a2 2 0 012 2V14h-2" />
          <rect x="6" y="11.5" width="8" height="5" rx="1" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={base} aria-hidden="true">
          <path d="M10 4.2v11.6M4.2 10h11.6" strokeLinecap="round" />
        </svg>
      )
    case 'arrow-left':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M15.8 10H4.5M8.8 5.6L4.2 10l4.6 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M4.2 10h11.3M11.2 5.6L15.8 10l-4.6 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'chevron-down':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M5.5 7.8L10 12.3l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'verified':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M10 2.5l2.2 1.4 2.6-.2.9 2.5 2.1 1.6-.8 2.5.8 2.5-2.1 1.6-.9 2.5-2.6-.2L10 18l-2.2-1.3-2.6.2-.9-2.5-2.1-1.6.8-2.5-.8-2.5 2.1-1.6.9-2.5 2.6.2L10 2.5z" />
          <path d="M7.3 10.2l1.8 1.8 3.7-3.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'external':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M11 3.8h5.2V9M16 4L9.2 10.8M14.5 11.5v3.7a1.5 1.5 0 01-1.5 1.5H4.8a1.5 1.5 0 01-1.5-1.5V7A1.5 1.5 0 014.8 5.5h3.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'trash':
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <path d="M4.2 5.8h11.6M7.8 5.8V4.2h4.4v1.6M6 5.8l.7 10a1.4 1.4 0 001.4 1.3h3.8a1.4 1.4 0 001.4-1.3l.7-10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={base} aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 9.2v4.3M10 6.5h.01" strokeLinecap="round" />
        </svg>
      )
  }
}
