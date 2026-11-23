import { formatUnits } from "../../lib/format";
import { getStockStatus, type StockStatus } from "./stock";

const stockStyles: Record<StockStatus, { badge: string; dot: string; label: string }> = {
  out: { badge: "bg-red-50 text-red-700", dot: "bg-red-500", label: "Sin stock" },
  low: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Stock bajo" },
  ok:  { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Stock suficiente",},
};

export function StockBadge({ stock }: { stock: number }) {
	const status = getStockStatus(stock);
	const style = stockStyles[status];
	const text = status === "out" ? style.label : formatUnits(stock);
	return (
		<span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${style.badge}`}>
			<span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
			{status === "out" && <span className='sr-only'>{style.label}</span>}
			{text}
		</span>
	) 
}