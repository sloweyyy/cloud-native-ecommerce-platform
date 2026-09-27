import { useState, useCallback } from 'react';
import { message } from 'antd';
import { Product } from '../services/products/schemas';
import { isProductInStock, getProductQuantity } from '../helpers/productUtils';
import { useAddToCart } from '../services/basket';

type UseProductActionsProps = {
  product: Product | null;
};

type UseProductActionsReturn = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  handleAddToCart: () => Promise<boolean>;
  handleBuyNow: () => void;
  handleAddToWishlist: () => void;
  canAddToCart: boolean;
  maxQuantity: number | undefined;
  isAddingToCart: boolean;
};

export function useProductActions({
  product,
}: UseProductActionsProps): UseProductActionsReturn {
  const [quantity, setQuantity] = useState(1);

  // Use the real add to cart mutation
  const addToCartMutation = useAddToCart();
  const isAddingToCart = addToCartMutation.isPending;

  const stockQuantity = product ? getProductQuantity(product) : 0;
  const hasStockInfo = product && (product as { stock?: { quantity?: number } }).stock !== undefined;
  
  const maxQuantity = stockQuantity > 0 ? stockQuantity : undefined;
  const canAddToCart = product
    ? (!hasStockInfo || isProductInStock(product)) &&
      quantity > 0 &&
      (maxQuantity === undefined || quantity <= maxQuantity) &&
      !isAddingToCart
    : false;

  const handleAddToCart = useCallback(async (): Promise<boolean> => {
    if (!product) {
      message.error('Product not available');
      return false;
    }

    if (!canAddToCart) {
      message.warning('Cannot add to cart. Please check stock availability.');
      return false;
    }

    try {
      // Call the real Basket API
      await addToCartMutation.mutateAsync({
        productId: product.id,
        productName: product.name,
        price: product.price,
        originalPrice: product.price,
        quantity,
        imageFile: product.imageFile ?? null,
      });

      message.success(`${product.name} (x${quantity}) added to cart!`);
      return true;
    } catch (error) {
      message.error('Failed to add item to cart');
      return false;
    }
  }, [product, quantity, canAddToCart, addToCartMutation]);

  const handleBuyNow = useCallback(async () => {
    if (!product) {
      message.error('Product not available');
      return;
    }

    if (!canAddToCart) {
      message.warning('Cannot buy now. Please check stock availability.');
      return;
    }

    try {
      const success = await handleAddToCart();
      if (success) {
        window.location.href = '/checkout';
      }
    } catch (error) {
      message.error('Failed to proceed to checkout');
    }
  }, [product, canAddToCart, handleAddToCart]);

  const handleAddToWishlist = useCallback(async () => {
    if (!product) {
      message.error('Product not available');
      return false;
    }

    try {
      // TODO: Implement actual add to wishlist API call
      // Example: await addToWishlistAPI(product.id);
      message.success(`${product.name} added to wishlist!`);
      return true;
    } catch (error) {
      message.error('Failed to add to wishlist');
      return false;
    }
  }, [product]);

  const handleSetQuantity = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) {
        setQuantity(1);
        return;
      }
      if (maxQuantity !== undefined && newQuantity > maxQuantity) {
        setQuantity(maxQuantity);
        return;
      }
      setQuantity(newQuantity);
    },
    [maxQuantity]
  );

  return {
    quantity,
    setQuantity: handleSetQuantity,
    handleAddToCart,
    handleBuyNow,
    handleAddToWishlist,
    canAddToCart,
    maxQuantity,
    isAddingToCart,
  };
}
