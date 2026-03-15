// ─────────────────────────────────────────────────────────────
// Wallet store — stub for Week 3 Cometh Connect integration
//
// This module is the ONLY place in the codebase that knows
// about wallets. Week 3 will swap out the mock implementation
// for Cometh Connect SDK without changing any imports elsewhere.
// ─────────────────────────────────────────────────────────────
import { writable, derived } from 'svelte/store';
import { setWallet } from './state';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WalletStore {
  address: string | null;
  status: WalletStatus;
  error: string | null;
}

const initial: WalletStore = {
  address: null,
  status: 'disconnected',
  error: null
};

export const wallet = writable<WalletStore>(initial);

// Derived convenience booleans
export const isConnected = derived(wallet, ($w) => $w.status === 'connected');
export const isConnecting = derived(wallet, ($w) => $w.status === 'connecting');

// ── Circles Mini App postMessage listener ──────────────────
// This runs once when the module is first imported.
// It handles wallet events from the Circles host iframe.
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e: MessageEvent) => {
    const { type, address } = e.data ?? {};

    if (type === 'wallet_connected' && address) {
      wallet.set({ address, status: 'connected', error: null });
      setWallet(address);
    }

    if (type === 'wallet_disconnected') {
      wallet.set({ address: null, status: 'disconnected', error: null });
      setWallet(null);
    }
  });
}

// ── Actions ────────────────────────────────────────────────

/**
 * Request wallet connection.
 *
 * In the Circles Mini App host: sends a postMessage to the host,
 * which handles the Cometh Connect passkey flow and responds with
 * wallet_connected.
 *
 * In standalone mode (dev / direct browser): falls back to a
 * deterministic demo address so the UI is always testable.
 *
 * Week 3: this function will also try Cometh Connect SDK directly
 * and WalletConnect v2 as a fallback.
 */
export async function connectWallet(): Promise<void> {
  wallet.update((w) => ({ ...w, status: 'connecting', error: null }));

  // 1. Try the Circles Mini App host first
  window.parent?.postMessage({ type: 'request_address' }, '*');

  // 2. Fallback after 800ms if no response (standalone / dev mode)
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      wallet.update((w) => {
        if (w.status !== 'connected') {
          // Demo address for development
          const demo = '0x' + Math.random().toString(16).slice(2, 10).toUpperCase() + '…b3c1';
          setWallet(demo);
          return { address: demo, status: 'connected', error: null };
        }
        return w;
      });
      resolve();
    }, 800);

    // If host responds before timeout, clear it
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'wallet_connected') {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        resolve();
      }
    };
    window.addEventListener('message', handler);
  });
}

export function disconnectWallet(): void {
  wallet.set({ address: null, status: 'disconnected', error: null });
  setWallet(null);
}

// ── On-chain transaction helper ────────────────────────────

export type TxResult = 'success' | 'rejected';

let pendingTxResolve: ((r: TxResult) => void) | null = null;

// Listen for tx responses from the Circles host
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e: MessageEvent) => {
    const { type } = e.data ?? {};
    if (type === 'tx_success' && pendingTxResolve) {
      pendingTxResolve('success');
      pendingTxResolve = null;
    }
    if (type === 'tx_rejected' && pendingTxResolve) {
      pendingTxResolve('rejected');
      pendingTxResolve = null;
    }
  });
}

/**
 * Submit an on-chain transaction via the Circles host.
 * Returns a promise that resolves when the host confirms or rejects.
 * Falls back to a modal confirmation in standalone mode.
 */
export function sendTransaction(params: {
  to: string;
  data: string;
  description: string;
}): Promise<TxResult> {
  return new Promise((resolve) => {
    pendingTxResolve = resolve;

    window.parent?.postMessage(
      {
        type: 'send_transactions',
        transactions: [{ to: params.to, value: '0', data: params.data }],
        requestId: Date.now().toString()
      },
      '*'
    );

    // Standalone fallback — the TxModal component resolves this
    // when the user confirms. Timeout after 30s to prevent hangs.
    setTimeout(() => {
      if (pendingTxResolve) {
        pendingTxResolve('rejected');
        pendingTxResolve = null;
      }
    }, 30_000);
  });
}

// Allows TxModal to resolve the pending transaction in standalone mode
export function resolvePendingTx(result: TxResult): void {
  if (pendingTxResolve) {
    pendingTxResolve(result);
    pendingTxResolve = null;
  }
}
