---
title: 'Glossary: Path Payment and Offer'
description: Short definitions for Path Payment and Offer as used in the Stellar DEX and Nextellar docs
---

# Glossary: Path Payment and Offer

Two terms central to Stellar's decentralized exchange (DEX).

---

## Path Payment

A Stellar operation that sends one asset and delivers a different asset to the recipient, automatically converting through one or more intermediate assets along the path. The sender specifies the asset they want to send and the asset the recipient should receive; Horizon finds conversion paths through the DEX.

**Common usage:** swapping USDC for XLM in a single transaction without manually managing intermediate trades. The `PathPaymentStrictSend` operation fixes the send amount; `PathPaymentStrictReceive` fixes the receive amount.

**Related operations:** `PathPaymentStrictSend`, `PathPaymentStrictReceive`, offer, DEX

---

## Offer

A standing order on Stellar's built-in DEX to buy or sell an asset at a specified price. Offers are stored on the ledger and matched against incoming path payments and other offers. A `ManageBuyOffer` or `ManageSellOffer` operation creates, updates, or cancels an offer.

**Common usage:** a liquidity provider posts an offer to sell USDC for XLM at a fixed rate. Path payment operations route through matching offers automatically.

**Related operations:** `ManageBuyOffer`, `ManageSellOffer`, `CreatePassiveSellOffer`, path payment, order book

**Related docs:** [Horizon Integration](/docs/integrations/horizon)
