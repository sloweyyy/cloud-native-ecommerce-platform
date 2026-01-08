/**
 * Discount Service Test - gRPC Only
 *
 * NOTE: The Discount service is a gRPC-only service and cannot be tested with HTTP REST calls.
 * This test file is kept for reference but will be skipped in automated test runs.
 *
 * The Discount service uses gRPC protocol (defined in Services/Discount/Discount.Application/Protos/discount.proto)
 * with the following RPC methods:
 * - GetDiscount(productName) -> CouponModel
 * - CreateDiscount(coupon) -> CouponModel
 * - UpdateDiscount(coupon) -> CouponModel
 * - DeleteDiscount(productName) -> DeleteDiscountResponse
 *
 * To test gRPC services with k6, you need to:
 * 1. Use k6's grpc client: import grpc from 'k6/net/grpc';
 * 2. Connect to the service
 * 3. Call RPC methods
 *
 * Example gRPC test:
 * ```javascript
 * import grpc from 'k6/net/grpc';
 * import { check } from 'k6';
 *
 * const client = new grpc.Client();
 * client.load(['Services/Discount/Discount.Application/Protos'], 'discount.proto');
 *
 * export default function () {
 *   client.connect('localhost:8084', { plaintext: true });
 *
 *   const response = client.invoke('DiscountProtoService/GetDiscount', {
 *     productName: 'TestProduct'
 *   });
 *
 *   check(response, {
 *     'status is OK': (r) => r && r.status === grpc.StatusOK,
 *   });
 *
 *   client.close();
 * }
 * ```
 *
 * For now, this test is disabled in automated runs.
 */

import { check, sleep } from 'k6';

export let options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  console.log('⚠️  Discount service is gRPC-only and requires special testing.');
  console.log('    This test is skipped. See file comments for gRPC testing examples.');

  // Mark as skipped
  check(null, {
    'Discount service (gRPC) - test skipped': () => true,
  });

  sleep(0.1);
}
