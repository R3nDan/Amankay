type RoyalWheatOrnamentProps = {
  side: "left" | "right";
};

/** Ornamento original inspirado en espigas y roleos de manuscritos medievales. */
export function RoyalWheatOrnament({ side }: RoyalWheatOrnamentProps) {
  return (
    <svg
      className={`royal-wheat-ornament royal-wheat-ornament-${side}`}
      viewBox="0 0 320 130"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <OrnamentDetail />
    </svg>
  );
}

/** Extensión fluida que une el roleo original con el borde exterior de la cabecera. */
export function WheatScrollConnector({ side }: RoyalWheatOrnamentProps) {
  return (
    <svg
      className={`wheat-scroll-connector wheat-scroll-connector-${side}`}
      viewBox="0 0 640 130"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 57c37 0 35 37 78 37 49 0 46-46 98-46 48 0 47 42 96 42 48 0 50-36 98-36 49 0 47 54 97 54 48 0 58-31 97-25 34 5 61 29 76 26" />
        <path d="M151 52c-8-12-7-22 1-31 9 8 11 19 5 30m-6-1c9-10 20-14 32-11-4 12-14 18-28 16m111 45c-6-12-4-22 5-30 7 10 7 20 0 30m2-1c11-8 22-10 33-5-7 10-18 14-31 10m78-57c-4-10-2-19 6-26 7 9 8 17 2 26m3 1c10-7 20-8 30-3-7 9-16 12-28 8" />
        <path d="M11 57c-7-5-8-11-4-15 4-4 10-2 11 2 1 4-2 6-6 6m572 49c8 5 9 11 5 15-4 4-10 2-11-2-1-4 2-6 6-6" strokeWidth="1.25" />
        <path d="M161 53l4 3m111 38 4 3m82-61 4 3m96 53 4 3" strokeWidth=".75" opacity=".8" />
      </g>
      <g fill="currentColor">
        <circle cx="135" cy="57" r="1.4" />
        <circle cx="331" cy="90" r="1.4" />
        <circle cx="466" cy="110" r="1.4" />
      </g>
    </svg>
  );
}

function OrnamentDetail() {
  return <>
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 109c34-5 51-20 67-39 18-22 30-43 61-52 22-7 46-4 52 8 5 10-3 21-15 23-10 2-17-5-14-12 2-5 9-7 13-3" />
      <path d="M35 103c12 2 21 7 28 15m-4-26c-2-12 0-21 7-30m15 14c13-2 23 0 31 6m-15-22c0-12 4-22 12-30m4 17c13-4 23-3 32 2m-18-16c2-9 7-17 14-22m2 16c11-5 22-6 32-3" />
      <path d="M34 102c7-8 18-12 29-10-3 11-13 18-25 17m21-17c-4-11-3-21 4-31 9 8 11 19 5 30m10-15c11-7 23-8 35-3-7 10-18 14-31 10m16-32c-1-12 3-23 13-31 6 11 5 22-2 33m6-17c11-9 23-11 36-7-7 12-18 17-32 15m14-23c5-10 15-17 29-19 1 13-6 23-20 29" />
      <path d="M12 109c-7 0-11-4-10-9 1-5 7-7 12-4 4 2 4 7 0 9m20 0c-7 8-8 14-4 19 4 4 10 3 12-1 2-4-1-8-5-8m65-45c-1-8 3-13 8-13 5 0 8 5 6 9-2 4-7 5-10 2" />
      <path d="M43 118l4 3m34-42 5 3m35-48 5 3m33-20 4 3" strokeWidth=".75" opacity=".8" />
    </g>
    <g fill="currentColor">
      <circle cx="23" cy="107" r="1.6" />
      <circle cx="119" cy="36" r="1.3" />
      <circle cx="156" cy="22" r="1.5" />
    </g>
  </>;
}
