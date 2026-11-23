type WheatDrawingProps = { className?: string; mirrored?: boolean; quiet?: boolean };

export function WheatDrawing({ className, mirrored = false, quiet = false }: WheatDrawingProps) {
  return <svg className={className} viewBox="0 0 210 330" fill="none" aria-hidden="true"
    focusable="false" style={mirrored ? { transform: "scaleX(-1)" } : undefined}>
    <g stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"
      opacity={quiet ? ".68" : ".94"}>
      <path d="M21 313C63 265 116 187 176 30" />
      <path d="M53 273C33 267 21 257 17 238c19 4 31 15 36 35Z" />
      <path d="M70 251C53 234 48 216 56 198c15 13 20 30 14 52Z" />
      <path d="M89 221c-6-22-1-40 16-54 7 19 2 37-16 54Z" />
      <path d="M108 185c-2-23 7-40 26-51 3 20-5 37-26 51Z" />
      <path d="M127 145c2-22 14-37 35-44 0 20-11 35-35 44Z" />
      <path d="M144 105c8-21 24-32 45-33-6 19-20 31-45 33Z" />
      <path d="M156 70c13-16 30-23 50-18-11 16-28 23-50 18Z" />
      <path d="M39 289C24 300 11 303 2 298c10-12 23-15 37-9Z" />
      <path d="M96 211c-18-6-29-18-32-37 17 5 28 17 32 37Z" />
      <path d="M116 168c-18-3-31-13-37-31 18 2 30 12 37 31Z" />
      <path d="M136 125c-17 0-31-8-40-25 18-1 31 8 40 25Z" />
      <path d="M153 86c-15-5-25-17-27-34 15 6 24 17 27 34Z" />
      <path d="M170 49c-12-9-17-23-13-39 12 9 16 22 13 39Z" />
      <path d="M33 299 4 306M58 274l-30-13M73 249l-10-36M96 215l-22-30M113 177l-3-35M134 134l-17-28M150 95l-4-30M165 61l-2-23" opacity=".45" />
    </g>
  </svg>;
}
