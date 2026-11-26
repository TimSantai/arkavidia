export function TabCorners() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 -top-5 size-5"
        style={{
          background:
            "radial-gradient(circle at 0 0, transparent 20px, var(--sheet) 20.5px)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 -bottom-5 size-5"
        style={{
          background:
            "radial-gradient(circle at 0 100%, transparent 20px, var(--sheet) 20.5px)",
        }}
      />
    </>
  )
}
