/**
 * Chuyển đổi giá từ nhiều định dạng (bao gồm MongoDB Decimal128) sang số
 */
export const formatPrice = (price: any): number => {
    if (!price) return 0;
    
    // Xử lý MongoDB Decimal128
    if (typeof price === 'object' && price !== null && '$numberDecimal' in price) {
      return parseFloat(price.$numberDecimal);
    }
    
    // Nếu đã là số
    if (typeof price === 'number') {
      return price;
    }
    
    // Trường hợp khác, cố gắng parse thành số
    return parseFloat(String(price)) || 0;
  };
  
  /**
   * Định dạng giá để hiển thị với 2 chữ số thập phân
   */
  export const formatPriceDisplay = (price: any): string => {
    return formatPrice(price).toLocaleString('vi-VN', {

    });
  };