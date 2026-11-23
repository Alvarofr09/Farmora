export const LOW_STOCK_THRESHOLD = 5;
export type StockStatus = "out" | "low" | "ok";

export function getStockStatus(stock: number): StockStatus {
	if (stock <= 0) return "out";
	return stock <= LOW_STOCK_THRESHOLD ? "low" : "ok";
}