import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cart from './Cart';

// Mock the cart hooks
jest.mock('../services/cart/hooks', () => ({
  useGetCart: jest.fn(() => ({
    data: {
      data: {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      },
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
  useUpdateCartItem: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useRemoveCartItem: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

describe('Cart', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  });

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  function renderCart(config?: Parameters<typeof Cart>[0]['config']) {
    return render(
      <QueryClientProvider client={queryClient}>
        <Cart config={config} />
      </QueryClientProvider>
    );
  }

  it('should render without crashing', () => {
    const { container } = renderCart();
    expect(container).toBeTruthy();
  });

  it('should render with config without crashing', () => {
    const config = {
      appContext: {
        user: { id: '1', firstName: 'John', lastName: 'Doe' },
      },
    };
    
    const { container } = renderCart(config);
    expect(container).toBeTruthy();
  });
});
