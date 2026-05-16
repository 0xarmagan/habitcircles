import { writable, derived } from 'svelte/store';
import { getAddress } from 'viem';
import { isMiniappMode, onWalletChange, sendTransactions, signMessage } from '@aboutcircles/miniapp-sdk';
import { setWallet } from './state';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WalletStore {
  address: string | null;
  status: WalletStatus;
  miniappMode: boolean;
}

const initial: WalletStore = {
  address: null,
  status: 'disconnected',
  miniappMode: false
};

export const wallet = writable<WalletStore>(initial);

export const isConnected = derived(wallet, ($w) => $w.status === 'connected');
export const isConnecting = derived(wallet, ($w) => $w.status === 'connecting');

// Initialize: detect miniapp mode and subscribe to wallet changes from host
if (typeof window !== 'undefined') {
  const miniappMode = isMiniappMode();
  wallet.update((w) => ({ ...w, miniappMode }));

  onWalletChange((address) => {
    try {
      const checksummed = address ? getAddress(address) : null;
      wallet.set({ address: checksummed, status: checksummed ? 'connected' : 'disconnected', miniappMode });
      setWallet(checksummed);
    } catch {
      wallet.update((w) => ({ ...w, address: null, status: 'error' }));
      setWallet(null);
    }
  });
}

// Standalone dev fallback — generates a demo address when not in miniapp host
export function connectDevWallet(): void {
  const demo = '0xDev' + Math.random().toString(16).slice(2, 10).toUpperCase();
  wallet.set({ address: demo, status: 'connected', miniappMode: false });
  setWallet(demo);
}

export type TxResult = 'success' | 'rejected';

export async function submitTransaction(params: {
  to: string;
  data?: string;
  value?: bigint;
}): Promise<TxResult> {
  try {
    const txs = [{
      to: params.to,
      data: params.data ?? '0x',
      value: params.value ? `0x${params.value.toString(16)}` : '0x0'
    }];
    const hashes = await sendTransactions(txs);
    return hashes.length > 0 ? 'success' : 'rejected';
  } catch {
    return 'rejected';
  }
}

export async function signHabitMessage(message: string): Promise<string | null> {
  try {
    const result = await signMessage(message, 'erc1271');
    return result.verified ? result.signature : null;
  } catch {
    return null;
  }
}

// Used by Dashboard — wraps submitTransaction for backward compat
export async function sendTransaction(params: {
  to: string;
  data: string;
  description: string;
}): Promise<TxResult> {
  return submitTransaction({ to: params.to, data: params.data });
}

// Used by TxModal in standalone dev mode
let pendingTxResolve: ((r: TxResult) => void) | null = null;

export function resolvePendingTx(result: TxResult): void {
  if (pendingTxResolve) {
    pendingTxResolve(result);
    pendingTxResolve = null;
  }
}
