const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const numberFormatter = new Intl.NumberFormat("es-ES");

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatUnits(value: number): string {
	return `${formatNumber(value)} ${value === 1 ? "unidad" : "unidades"}`;
}