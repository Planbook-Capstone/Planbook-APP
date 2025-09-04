export const formatVietnameseDateTime = (dateTime: Date | string): string => {
  if (!dateTime) return "";

  const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;

  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(date.getTime())) return "Ngày không hợp lệ";

  // Lấy giờ, phút
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Lấy ngày, tháng, năm
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  // Định dạng: "giờ:phút - ngày/tháng/năm"
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};
