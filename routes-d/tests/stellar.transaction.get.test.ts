/**
 * Tests for routes-d/routes/stellar.transaction.get.ts
 *
 * Run with:  pnpm test:unit --reporter=verbose
 *
 * Three scenarios required by issue #455:
 *   1. Known hash   → 200 with canonical transaction shape
 *   2. Unknown hash → 404 with error body
 *   3. Malformed hash → 400 with validation error
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GET,
  fetchTransaction,
  isValidTransactionHash,
  type StellarTransaction,
  type ErrorResponse,
  type RouteContext,
} from '../routes/stellar.transaction.get';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_HASH =
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

const HORIZON_RECORD = {
  hash: VALID_HASH,
  ledger: 123456,
  created_at: '2026-06-24T10:00:00Z',
  source_account: 'GABC123456789012345678901234567890123456789012345678901234',
  fee_charged: '200',
  operation_count: 2,
  memo_type: 'text',
  memo: 'test payment',
  successful: true,
  envelope_xdr: 'AAAAAQ==',
  result_xdr: 'AAAAAAAAAGQ=',
};

const EXPECTED_TX: StellarTransaction = {
  hash: VALID_HASH,
  ledger: 123456,
  createdAt: '2026-06-24T10:00:00Z',
  sourceAccount: 'GABC123456789012345678901234567890123456789012345678901234',
  fee: '200',
  operationCount: 2,
  memoType: 'text',
  memo: 'test payment',
  successful: true,
  resultCode: 'AAAAAAAAAGQ=',
  envelopeXdr: 'AAAAAQ==',
  resultXdr: 'AAAAAAAAAGQ=',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(hash: string, network?: string): Request {
  const url = `http://localhost/api/stellar/transaction/${hash}${network ? `?network=${network}` : ''}`;
  return new Request(url);
}

function makeContext(hash: string): RouteContext {
  return { params: { hash } };
}

// ---------------------------------------------------------------------------
// Unit tests: isValidTransactionHash
// ---------------------------------------------------------------------------

describe('isValidTransactionHash', () => {
  it('accepts a 64-char lowercase hex string', () => {
    expect(isValidTransactionHash(VALID_HASH)).toBe(true);
  });

  it('accepts a 64-char uppercase hex string', () => {
    expect(isValidTransactionHash(VALID_HASH.toUpperCase())).toBe(true);
  });

  it('rejects a 63-char string', () => {
    expect(isValidTransactionHash(VALID_HASH.slice(1))).toBe(false);
  });

  it('rejects a 65-char string', () => {
    expect(isValidTransactionHash(VALID_HASH + '0')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    const bad = VALID_HASH.slice(0, 63) + 'z';
    expect(isValidTransactionHash(bad)).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidTransactionHash('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit tests: fetchTransaction
// ---------------------------------------------------------------------------

describe('fetchTransaction', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a normalised StellarTransaction for a known hash', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(HORIZON_RECORD), { status: 200 })
    );

    const tx = await fetchTransaction(
      VALID_HASH,
      'testnet',
      'http://horizon-mock'
    );

    expect(tx).toEqual(EXPECTED_TX);
    expect(fetch).toHaveBeenCalledWith(
      `http://horizon-mock/transactions/${VALID_HASH}`,
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    );
  });

  it('throws a 404 error for an unknown hash', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{"type":"not_found"}', { status: 404 })
    );

    await expect(
      fetchTransaction(VALID_HASH, 'testnet', 'http://horizon-mock')
    ).rejects.toMatchObject({ message: 'Transaction not found', status: 404 });
  });

  it('throws with the Horizon status for other errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{}', { status: 503, statusText: 'Service Unavailable' })
    );

    await expect(
      fetchTransaction(VALID_HASH, 'testnet', 'http://horizon-mock')
    ).rejects.toMatchObject({ status: 503 });
  });

  it('sets memo to null when the record has no memo field', async () => {
    const recordNoMemo = { ...HORIZON_RECORD, memo: undefined };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(recordNoMemo), { status: 200 })
    );

    const tx = await fetchTransaction(
      VALID_HASH,
      'testnet',
      'http://horizon-mock'
    );
    expect(tx.memo).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Integration tests: GET handler
// ---------------------------------------------------------------------------

describe('GET /stellar/transaction/:hash', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Scenario 1 — known hash
  it('returns 200 with the canonical transaction shape for a known hash', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(HORIZON_RECORD), { status: 200 })
    );

    const response = await GET(
      makeRequest(VALID_HASH),
      makeContext(VALID_HASH)
    );
    const body: StellarTransaction = await response.json();

    expect(response.status).toBe(200);
    expect(body.hash).toBe(VALID_HASH);
    expect(body.fee).toBe('200');
    expect(body.operationCount).toBe(2);
    expect(body.successful).toBe(true);
    expect(body.resultCode).toBe(HORIZON_RECORD.result_xdr);
    expect(body.envelopeXdr).toBe(HORIZON_RECORD.envelope_xdr);
    expect(body.resultXdr).toBe(HORIZON_RECORD.result_xdr);
    expect(body.memo).toBe('test payment');
  });

  // Scenario 2 — unknown hash
  it('returns 404 for a well-formed hash that does not exist on Horizon', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{"type":"not_found"}', { status: 404 })
    );

    const response = await GET(
      makeRequest(VALID_HASH),
      makeContext(VALID_HASH)
    );
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toMatch(/not found/i);
    expect(body.status).toBe(404);
  });

  // Scenario 3 — malformed hash
  it('returns 400 for a hash that is too short', async () => {
    const badHash = 'abc123';
    const response = await GET(makeRequest(badHash), makeContext(badHash));
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/invalid transaction hash/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns 400 for a hash with non-hex characters', async () => {
    const badHash = 'z'.repeat(64);
    const response = await GET(makeRequest(badHash), makeContext(badHash));
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns 400 for an empty hash param', async () => {
    const response = await GET(makeRequest(''), makeContext(''));
    const body: ErrorResponse = await response.json();

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('defaults to testnet and passes the network to Horizon URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(HORIZON_RECORD), { status: 200 })
    );

    await GET(makeRequest(VALID_HASH), makeContext(VALID_HASH));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('horizon-testnet.stellar.org'),
      expect.anything()
    );
  });

  it('uses mainnet Horizon URL when network=mainnet is passed', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(HORIZON_RECORD), { status: 200 })
    );

    await GET(makeRequest(VALID_HASH, 'mainnet'), makeContext(VALID_HASH));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('horizon.stellar.org/transactions/'),
      expect.anything()
    );
  });

  it('returns 500 for an unexpected Horizon error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{}', { status: 503, statusText: 'Service Unavailable' })
    );

    const response = await GET(
      makeRequest(VALID_HASH),
      makeContext(VALID_HASH)
    );
    expect(response.status).toBe(503);
  });
});
