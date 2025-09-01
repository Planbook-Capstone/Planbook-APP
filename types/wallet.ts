// --- Định nghĩa kiểu dữ liệu (thêm tokenBefore và orderId) ---
export type Transaction = {
  id: string;
  orderId: string;
  type: "TOOL_USAGE" | "RECHARGE" | "REFUND" | "REWARD";
  tokenBefore: number;
  tokenChange: number;
  description: string;
  createdAt: string;
};

export type TransactionItemProps = {
  item: Transaction;
  onPress: () => void; // Thêm prop onPress
};