export function PixelHeart({ className }: { readonly className?: string }) {
  return (
    <svg
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Top lobes */}
      <rect x="2" y="0" width="4" height="2" fill="#f1d69b" />
      <rect x="10" y="0" width="4" height="2" fill="#e0bb6c" />
      {/* Upper body */}
      <rect x="0" y="2" width="16" height="2" fill="#e0bb6c" />
      <rect x="2" y="2" width="4" height="2" fill="#f1d69b" />
      {/* Mid body */}
      <rect x="0" y="4" width="16" height="2" fill="#e0bb6c" />
      <rect x="2" y="6" width="12" height="2" fill="#c59b37" />
      <rect x="4" y="8" width="8" height="2" fill="#c59b37" />
      <rect x="6" y="10" width="4" height="2" fill="#c59b37" />
      <rect x="7" y="12" width="2" height="2" fill="#c59b37" />
    </svg>
  )
}
