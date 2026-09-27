import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Flex, Typography, Button } from 'antd';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { useNavigate } from '../../utils/navigation-handler';
import NavbarActions from './NavbarActions';
import NavbarCategories from './NavbarCategories';
import NavbarQuickLinks from './NavbarQuickLinks';
import { CartItem } from '../CartPreview/CartPreview';
import { brandGradient } from '../../constants/theme';

const { Title } = Typography;

/**
 * Custom event name for cross-module cart updates
 * Must match the event name in store/src/services/basket/hooks.ts
 */
const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

export interface NavbarProps {
  /** Number of items in basket */
  basketCount?: number;
  /** Cart items for preview */
  cartItems?: CartItem[];
  /** Loading state for cart data */
  isLoading?: boolean;
  /** Callback when removing item from cart */
  onRemoveCartItem?: (id: string) => void;
  /** Current app name for navigation fallback (e.g., 'store', 'checkout') */
  appName?: string;
  /** Categories for the categories dropdown */
  categories?: Array<{ id: string; name: string; icon?: string; path: string }>;
  /** Loading state for categories */
  categoriesLoading?: boolean;
}

function Navbar({
  basketCount = 0,
  cartItems = [],
  isLoading = false,
  onRemoveCartItem,
  appName,
  categories,
  categoriesLoading = false,
}: NavbarProps) {
  const navigate = useNavigate(appName);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Listen for cart updates from other modules (e.g., store)
  useEffect(() => {
    function handleCartUpdated() {
      // Get current username from auth to ensure we use the latest user info
      const currentUserName =
        user?.email || user?.displayName || user?.id || 'guest';
      console.log(
        '[Navbar] Cart updated event received, invalidating and refetching basket for user:',
        currentUserName
      );
      // Invalidate cache to force refetch, even if data is still fresh
      queryClient.invalidateQueries({
        queryKey: ['basket', 'byUser', currentUserName],
      });
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [queryClient, user]);

  const handleRemoveCartItem = (id: string) => {
    // Note: Remove functionality will be handled by checkout module
    // Here we just log and could trigger a refetch
    console.info('Remove cart item:', id);
    // Navigate to checkout for actual removal
    navigate('/checkout');
  };

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
              basketCount={basketCount}
              cartItems={cartItems}
              isLoading={isLoading}
              onRemoveCartItem={onRemoveCartItem || handleRemoveCartItem}
              appName={appName}
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
            <NavbarCategories
              categories={categories}
              isLoading={categoriesLoading}
              appName={appName}
            />
            <NavbarQuickLinks appName={appName} />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}

export default Navbar;
export { Navbar };
