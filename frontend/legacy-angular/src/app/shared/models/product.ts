export interface IProduct {
  id: string;
  name: string;
  description: string;
  imageFile: string;
  price: number;
  productType: string;
  productBrand: string;
  // Discount information (optional for backward compatibility)
  originalPrice?: number;
  discountAmount?: number;
  hasDiscount?: boolean;
}

export interface IProductWithDiscount extends IProduct {
  originalPrice: number;
  discountAmount: number;
  hasDiscount: boolean;
}
