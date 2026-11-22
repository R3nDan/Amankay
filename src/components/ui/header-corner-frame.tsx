type HeaderCornerFrameProps = {
  side: "left" | "right";
};

/** Delimitación recta con roleos y espigas en las esquinas de la cabecera. */
export function HeaderCornerFrame({ side }: HeaderCornerFrameProps) {
  return (
    <svg
      className={`header-corner-frame header-corner-frame-${side}`}
      viewBox="0 0 280 114"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="header-corner-sprig" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 103c30-8 39-30 58-49 18-18 39-26 59-31 13-3 24 1 24 9 0 7-7 11-13 8-5-2-5-8 0-10" />
        <path d="M35 96c10 1 17 5 22 12m-4-20c-1-9 2-17 8-24m11 12c10-2 18 0 24 5m-10-18c0-9 4-17 11-23m4 12c10-3 18-2 25 2m-13-12c2-7 7-12 13-16m2 11c9-4 17-4 25-1" />
        <path d="M34 96c6-6 14-9 23-8-3 9-10 14-20 14m18-16c-3-9-2-16 4-24 7 7 8 15 4 23m9-12c9-5 18-6 27-2-5 8-13 11-24 8m13-25c0-9 4-17 12-23 5 8 4 17-2 25m6-13c9-6 18-7 28-4-6 9-14 13-25 11m11-18c4-8 11-13 22-15 1 10-4 18-15 22" />
        <path d="M18 103c-6 0-9-3-8-7 1-4 5-5 9-3 3 2 3 5 0 7m17-2c-5 6-6 11-3 14 3 3 8 2 9-1 2-3-1-6-4-6m84-57c-1-6 2-10 6-10 4 0 6 4 5 7-2 3-5 4-8 2" />
      </g>
    </svg>
  );
}
