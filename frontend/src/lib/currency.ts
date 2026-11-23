export const formatPrice = (value: number) => {
  const locale = typeof document !== "undefined" && document.documentElement.lang ? document.documentElement.lang : "es-CO";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
};
