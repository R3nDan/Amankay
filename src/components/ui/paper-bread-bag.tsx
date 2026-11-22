export function PaperBreadBag({ open = false }: { open?: boolean }) {
  return <svg className={`paper-bread-bag${open ? " is-open" : ""}`} viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path className="bag-back" d="M9 15 35 15 37 44 33 48 11 48 7 44Z" />
    <path className="bag-mouth" d="M8 15Q22 8 36 15Q22 21 8 15Z" />
    <path className="bag-left-fold" d="M8 17 12 20 11 43" />
    <path className="bag-right-fold" d="M36 17 32 20 33 43" />
    <path className="bag-front" d="M11 20 11 45 33 45 33 20" />
    <path className="bag-bottom" d="M7 44 11 47 33 47 37 44" />
    <path className="bag-crease" d="M14 22 14 41M30 22 30 41" />
  </svg>;
}
