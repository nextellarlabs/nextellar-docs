/**
 * GET /stellar/transaction/:hash
 *
 * Fetches a single Stellar transaction by its hash from the Horizon API.
 *
 * Usage (Next.js App Router):
 *   Copy or re-export this handler from
 *   src/app/api/stellar/transaction/[hash]/route.ts
 *
 * The handler is kept dependency-free (plain fetch) so it works in any
 * Edge or Node.js runtime without installing additional packages.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Canonical transaction shape returned to callers. */
export interface StellarTransaction {
  hash: string;
  ledger: number;
  createdAt: string;
  sourceAccount: string;
  fee: string;
  operationCount: number;
  memoType: string;
  memo: string | null;
  successful: boolean;
  resultCode: string;
  envelopeXdr: string;
  resultXdr: string;
}

/** Shape returned by the Horizon transactions endpoint. */
interface HorizonTransactionRecord {
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  fee_charged: string;
  operation_count: number;
  memo_type: string;
  memo?: string;
  successful: boolean;
  result_meta_xdr?: string;
  envelope_xdr: string;
  result_xdr: string;
}

export interface ErrorResponse {
  error: string;
  status: number;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * A Stellar transaction hash is a 64-character hex string (SHA-256 of the
 * transaction XDR, encoded as uppercase or lowercase hex).
 */
const HASH_RE = /^[0-9a-fA-F]{64}$/;

export function isValidTransactionHash(hash: string): boolean {
  return HASH_RE.test(hash);
}

// ---------------------------------------------------------------------------
// Horizon fetch
// ---------------------------------------------------------------------------

const HORIZON_URLS: Record<string, string> = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

/**
 * Fetches a transaction from Horizon and normalises it to
 * {@link StellarTransaction}.
 *
 * @param hash      - 64-character hex transaction hash
 * @param network   - "testnet" | "mainnet" (default: "testnet")
 * @param horizonUrl - override the Horizon base URL (useful in tests)
 */
export async function fetchTransaction(
  hash: string,
  network: 'testnet' | 'mainnet' = 'testnet',
  horizonUrl?: string
): Promise<StellarTransaction> {
  const base = horizonUrl ?? HORIZON_URLS[network];
  const url = `${base}/transactions/${encodeURIComponent(hash)}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (res.status === 404) {
    const err = new Error('Transaction not found') as Error & {
      status: number;
    };
    err.status = 404;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(
      `Horizon error: ${res.status} ${res.statusText}`
    ) as Error & {
      status: number;
    };
    err.status = res.status;
    throw err;
  }

  const record: HorizonTransactionRecord = await res.json();
  return normalise(record);
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

function normalise(r: HorizonTransactionRecord): StellarTransaction {
  return {
    hash: r.hash,
    ledger: r.ledger,
    createdAt: r.created_at,
    sourceAccount: r.source_account,
    fee: r.fee_charged,
    operationCount: r.operation_count,
    memoType: r.memo_type,
    memo: r.memo ?? null,
    successful: r.successful,
    resultCode: extractResultCode(r.result_xdr),
    envelopeXdr: r.envelope_xdr,
    resultXdr: r.result_xdr,
  };
}

/**
 * Extracts a human-readable result code from the raw result XDR string.
 * The full XDR decode would require the Stellar SDK; here we return the
 * raw result_xdr as the code so the route stays dependency-free while
 * still exposing the value to callers.
 *
 * Swap this for a proper XDR decode when @stellar/stellar-sdk is available:
 *   import { xdr } from '@stellar/stellar-sdk';
 *   const result = xdr.TransactionResult.fromXDR(resultXdr, 'base64');
 *   return result.result().switch().name;
 */
function extractResultCode(resultXdr: string): string {
  // txSUCCESS / txFAILED are the two common top-level results.
  // A full decode is possible with the Stellar SDK; the raw XDR is
  // included on the response so callers can decode it themselves.
  return resultXdr;
}

// ---------------------------------------------------------------------------
// Route handler (Next.js App Router compatible)
// ---------------------------------------------------------------------------

export interface RouteContext {
  params: { hash: string };
}

/**
 * Next.js App Router GET handler.
 *
 * Mount at: src/app/api/stellar/transaction/[hash]/route.ts
 *
 * ```ts
 * export { GET } from '@/routes-d/routes/stellar.transaction.get';
 * ```
 */
export async function GET(
  request: Request,
  context: RouteContext
): Promise<Response> {
  const { hash } = context.params;

  // 1. Validate hash format
  if (!hash || !isValidTransactionHash(hash)) {
    const body: ErrorResponse = {
      error:
        'Invalid transaction hash. Expected a 64-character hexadecimal string.',
      status: 400,
    };
    return Response.json(body, { status: 400 });
  }

  // 2. Resolve network from query param (default testnet)
  const { searchParams } = new URL(request.url);
  const network =
    searchParams.get('network') === 'mainnet' ? 'mainnet' : 'testnet';

  // 3. Fetch from Horizon
  try {
    const tx = await fetchTransaction(hash, network);
    return Response.json(tx, { status: 200 });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    const message =
      err instanceof Error
        ? err.message
        : 'Unexpected error fetching transaction';

    const body: ErrorResponse = { error: message, status };
    return Response.json(body, { status });
  }
}
