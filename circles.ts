// ─────────────────────────────────────────────────────────────
// Circles Mini App SDK utilities
//
// Handles the postMessage protocol defined by:
// https://github.com/aboutcircles/CirclesMiniapps
//
// Week 3 will extend this with Cometh Connect SDK calls.
// ─────────────────────────────────────────────────────────────

/**
 * Encode arbitrary data as base64 for the Circles ?data= URL parameter.
 * Sponsors use this to deep-link to their habit from marketing materials.
 *
 * Example URL: https://circles.gnosis.io/miniapps/habitcircles?data=<encoded>
 */
export function encodeAppData(data: Record<string, unknown>): string {
  return btoa(JSON.stringify(data));
}

/**
 * Decode the ?data= parameter passed from the Circles host.
 * Returns null if absent or malformed.
 */
export function decodeAppData(encoded: string | null): Record<string, unknown> | null {
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

/**
 * Build the calldata for a habit completion attestation.
 * This is written on-chain as evidence of completion.
 *
 * Format: keccak-style ABI encoding placeholder.
 * Week 8 will replace this with the actual contract ABI encoding.
 */
export function buildCompletionCalldata(params: {
  habitId: string;
  date: string;
  verified: boolean;
  cycleId?: string;
}): string {
  const payload = JSON.stringify(params);
  // Simple hex encoding for now — replaced by ABI encoding in Week 8
  return '0x' + Array.from(new TextEncoder().encode(payload))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 64); // trim to reasonable calldata length for testnet
}

/**
 * The contract address that receives completion attestations.
 * Points to a no-op address on testnet until contracts are deployed.
 */
export const ATTESTATION_CONTRACT = import.meta.env.PUBLIC_CHALLENGE_REGISTRY_ADDRESS
  || '0x0000000000000000000000000000000000000000';

export const GNOSIS_CHAIN_ID = 100;
export const CHIADO_CHAIN_ID = 10200;

export function getActiveChainId(): number {
  return import.meta.env.PUBLIC_CHAIN === 'gnosis' ? GNOSIS_CHAIN_ID : CHIADO_CHAIN_ID;
}
