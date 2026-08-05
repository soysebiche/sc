import { expect, test, vi } from 'vitest';
import handler from '../../api/vitals/index';

const createResponse = () => {
  const response = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
};

test('accepts a valid, anonymous Web Vital payload', () => {
  const response = createResponse();
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});

  handler({
    method: 'POST',
    body: {
      name: 'LCP',
      value: 2145.6789,
      rating: 'good',
      route: '/',
      view: 'dashboard',
      revision: '2026.08.04',
    },
  }, response);

  expect(response.status).toHaveBeenCalledWith(202);
  expect(response.json).toHaveBeenCalledWith({ accepted: true });
  expect(log).toHaveBeenCalledWith('RUM_METRIC', expect.stringContaining('"name":"LCP"'));
  log.mockRestore();
});

test('rejects unsupported methods and malformed metrics', () => {
  const methodResponse = createResponse();
  handler({ method: 'GET' }, methodResponse);
  expect(methodResponse.status).toHaveBeenCalledWith(405);

  const payloadResponse = createResponse();
  handler({ method: 'POST', body: { name: 'email', value: 1, rating: 'good' } }, payloadResponse);
  expect(payloadResponse.status).toHaveBeenCalledWith(400);
});
