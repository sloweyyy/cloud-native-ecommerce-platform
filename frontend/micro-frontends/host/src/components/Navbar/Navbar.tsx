import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Flex, Typography, Button } from 'antd';
import NavbarActions from './NavbarActions';
import NavbarCategories from './NavbarCategories';
import NavbarQuickLinks from './NavbarQuickLinks';
import { CartItem } from '../CartPreview/CartPreview';
import { brandGradient } from '../../config/theme';
import { useBasket, basketCacheKeys } from '../../services/basket';
import type { BasketItem } from '../../services/basket';
import { useAuth } from '@ecommerce-platform/auth-provider';

const { Title } = Typography;

/**
 * Custom event name for cross-module cart updates
 * Must match the event name in store/src/services/basket/hooks.ts
 */
const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch basket data using React Query
  const { items, itemCount, isLoading } = useBasket();

  // Listen for cart updates from other modules (e.g., store)
  useEffect(() => {
    function handleCartUpdated(event: Event) {
      const customEvent = event as CustomEvent;
      const eventUserName = customEvent.detail?.userName;
      
      // Get current username from auth to ensure we use the latest user info
      const currentUserName =
        user?.email || user?.displayName || user?.id || 'guest';
      
      // Invalidate cache to force refetch, even if data is still fresh
      queryClient.invalidateQueries({
        queryKey: basketCacheKeys.byUser(currentUserName),
      });
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [queryClient, user]);

  // Map BasketItem to CartItem format for CartPreview
  const cartItems: CartItem[] = useMemo(() => {
    return items.map((item: BasketItem) => ({
      id: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      image: item.imageFile || '',
    }));
  }, [items]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
      }}
    >
      <Flex
        vertical
        style={{
          background: '#ffffff',
        }}
      >
        <Flex
          style={{
            background: '#ffffff',
            padding: '16px 0',
            borderBottom: '1px solid #f1f5f9',
            height: 88,
            alignItems: 'center',
          }}
        >
          <Flex
            style={{
              maxWidth: 1400,
              margin: '0 auto',
              padding: '0 32px',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 40,
            }}
          >
            <Button
              type="text"
              onClick={() => navigate('/')}
              style={{
                minWidth: 180,
                padding: 0,
                height: 'auto',
                textAlign: 'left',
              }}
              aria-label="NextTech home"
            >
              <Title
                level={1}
                style={{
                  margin: 0,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: brandGradient.start,
                  letterSpacing: '-0.5px',
                }}
              >
                NextTech
              </Title>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: 10,
                  letterSpacing: '1.5px',
                  marginTop: 4,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                }}
              >
                Tech Store
              </Typography.Text>
            </Button>

            <NavbarActions
              basketCount={itemCount}
              cartItems={cartItems}
              isLoading={isLoading}
            />
          </Flex>
        </Flex>

        <Flex
          style={{
            borderBottom: '1px solid #f1f1f1',
            height: 64,
            alignItems: 'center',
          }}
        >
          <Flex
            style={{
              maxWidth: 1400,
              margin: '0 auto',
              padding: '0 32px',
              width: '100%',
              alignItems: 'center',
              gap: 32,
            }}
          >
            <NavbarCategories />
            <NavbarQuickLinks />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}

export default Navbar;
