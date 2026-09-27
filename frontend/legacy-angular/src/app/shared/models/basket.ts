export interface IBasketItem {
  quantity: number;
  imageFile: string;
  price: number;
  originalPrice: number;
  discountAmount: number;
  productId: string;
  productName: string;
}

export interface IBasket {
  userName: string;
  items: IBasketItem[];
  totalPrice: number;
}

export class Basket implements IBasket {
  userName: string = '';
  totalPrice: number = 0;
  items: IBasketItem[] = [];
}

export interface IBasketTotal {
  total: number;
  totalSavings: number;
  originalTotal: number;
}
