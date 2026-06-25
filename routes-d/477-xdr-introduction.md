---
title: "Note: XDR on Stellar"
description: A brief introduction to XDR — what it is, where it appears, and where to learn more
---

# XDR on Stellar

XDR (External Data Representation) is the binary serialization format Stellar uses to encode transactions, operations, ledger entries, and results. It is defined by RFC 4506 and produces compact, deterministic byte sequences that validators and clients exchange.

---

## Where XDR Appears

You will encounter XDR in several places:

| Context | How it shows up |
|---------|----------------|
| Horizon responses | `envelope_xdr`, `result_xdr`, `result_meta_xdr` fields (base64-encoded) |
| Transaction signing | `TransactionBuilder.build()` returns an XDR envelope |
| Soroban RPC | `simulateTransaction`, `sendTransaction`, and `getTransaction` all use XDR |
| Stellar Laboratory | The "XDR Viewer" tab decodes raw XDR blobs manually |

---

## Quick Example

```js
import { xdr, TransactionEnvelope } from "@stellar/stellar-sdk";

// Decode a transaction envelope returned by Horizon
const envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdrBase64, "base64");
```

---

## Further Reading

- [XDR Encoding and Decoding](/routes-d/482-xdr-encoding-decoding) — detailed decode helpers for transactions, results, and metadata
- [Stellar XDR definitions on GitHub](https://github.com/stellar/stellar-xdr) — the canonical `.x` schema files
- RFC 4506 — the underlying XDR standard

**Related:** Horizon, Soroban RPC, TransactionBuilder, `envelope_xdr`
