import { useState, useCallback } from 'react';
import { message } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { Product } from '../services/products/types';
import { isProductInStock, getProductQuantity } from '../helpers/productUtils';
import { useAddToCart } from '../services/basket';

type UseProductActionsProps = {
  product: Product | null;
  config?: AppInjectorProps['config'];
};

type UseProductActionsReturn = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  handleAddToCart: () => Promise<boolean>;
  handleBuyNow: () => void;
  handleAddToWishlist: () => void;
  canAddToCart: boolean;
  maxQuantity: number;
  isAddingToCart: boolean;
};

export function useProductActions({
  product,
  config,
}: UseProductActionsProps): UseProductActionsReturn {
  const [quantity, setQuantity] = useState(1);
  const { onNavigate, onError } = config || {};

  // Use the real add to cart mutation
  const addToCartMutation = useAddToCart();
  const isAddingToCart = addToCartMutation.isPending;

  const maxQuantity = product ? getProductQuantity(product) : 0;
  const canAddToCart = product
    ? isProductInStock(product) &&
      quantity > 0 &&
      quantity <= maxQuantity &&
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
        originalPrice: product.originalPrice ?? product.price,
        quantity,
        imageFile: product.imageFile ?? null,
      });

      message.success(`${product.name} (x${quantity}) added to cart!`);
      return true;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to add item to cart');
      }
      return false;
    }
  }, [product, quantity, canAddToCart, addToCartMutation, onError]);

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
      // Add to cart first and wait for success
      const success = await handleAddToCart();

      // Only navigate to checkout if cart addition was successful
      if (success && onNavigate) {
        onNavigate('/checkout');
      }
    } catch (error) {
      const errorMsg = 'Failed to proceed to checkout';
      message.error(errorMsg);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [product, canAddToCart, handleAddToCart, onNavigate, onError]);

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
      if (onError) {
        onError(error as Error);
      } else {
        message.error('Failed to add to wishlist');
      }
      return false;
    }
  }, [product, onError]);

  const handleSetQuantity = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) {
        setQuantity(1);
        return;
      }
      if (maxQuantity > 0 && newQuantity > maxQuantity) {
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
