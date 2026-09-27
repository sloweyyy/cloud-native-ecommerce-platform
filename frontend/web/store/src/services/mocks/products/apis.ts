import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse, findItemByUri } from '../utils';
import { mockProducts, mockBrands, mockTypes } from './data';

const ENDPOINT = '/api/v1/mock/Catalog';

export default function register(mockAdapter: MockAdapter) {
  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllProducts`))
    .reply((config) => {
      const { PageIndex, PageSize, Search, BrandId, TypeId, Sort } =
        config.params || {};

      const page = Number(PageIndex ?? 1) || 1;
      const limit = Number(PageSize ?? 10) || 10;

      let filtered = [...mockProducts];

      if (BrandId) {
        filtered = filtered.filter((p) => p.brands.id === BrandId);
      }

      if (TypeId) {
        filtered = filtered.filter((p) => p.types.id === TypeId);
      }

      if (Search) {
        const searchLower = String(Search).toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
      }

      if (Sort) {
        if (Sort === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
        else if (Sort === 'priceDesc')
          filtered.sort((a, b) => b.price - a.price);
        else if (Sort === 'nameAsc')
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        else if (Sort === 'nameDesc')
          filtered.sort((a, b) => b.name.localeCompare(a.name));
      }

      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      return [
        200,
        createResponse({
          pageIndex: page,
          pageSize: limit,
          count: filtered.length,
          data,
        }),
      ];
    });

  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetProductById/:id`))
    .reply((config) => {
      const [status, response] = findItemByUri({
        pattern: `${ENDPOINT}/GetProductById/:id`,
        config,
        data: mockProducts,
        property: 'id',
        index: 5,
      });

      if (status === 200 && 'id' in response) {
        return [200, createResponse(response)];
      }

      return [status, response];
    });

  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllBrands`))
    .reply(200, createResponse(mockBrands));

  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllTypes`))
    .reply(200, createResponse(mockTypes));
}
