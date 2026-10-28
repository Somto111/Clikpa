import { useMemo, useState } from 'react'
import { generateQrMatrix } from '../../utils/qr'
import { cn } from '../../utils/cn'
import { Button } from './Button'
import { Icon } from '../Icons'

export function QrCodeBox({ value, label = 'Deposit address QR code' }) {
  const [enlarged, setEnlarged] = useState(false)
  const matrix = useMemo(() => generateQrMatrix(value), [value])
  const size = matrix.length
  const quietZone = 3
  const viewBoxSize = size + quietZone * 2

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'rounded-2xl border border-border-muted bg-surface p-3 shadow-xs',
          enlarged ? 'w-64 sm:w-72' : 'w-44 sm:w-48',
        )}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          role="img"
          aria-label={label}
          className="h-full w-full"
          shapeRendering="crispEdges"
        >
          <rect width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" />
          {matrix.map((row, r) =>
            row.map((dark, c) =>
              dark ? (
                <rect
                  key={`${r}-${c}`}
                  x={c + quietZone}
                  y={r + quietZone}
                  width="1"
                  height="1"
                  fill="#0F172A"
                />
              ) : null,
            ),
          )}
        </svg>
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={() => setEnlarged((prev) => !prev)}
        aria-label={enlarged ? 'Make QR code smaller' : 'Enlarge QR code for easier scanning'}
      >
        <Icon name="qr" className="h-4 w-4" />
        <span>{enlarged ? 'Smaller QR code' : 'Enlarge QR code'}</span>
      </Button>
    </div>
  )
}
