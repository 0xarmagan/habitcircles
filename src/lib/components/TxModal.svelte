<script lang="ts">
  import type { TxResult } from '$lib/stores/wallet';

  export let description: string;
  export let onResult: (r: TxResult) => void;
</script>

<div class="modal-backdrop" role="presentation">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="spinner"></div>
    <div class="tx-title">Confirming transaction</div>
    <div class="tx-desc">{description}</div>

    <div class="tx-footer">
      <div class="tx-hint">Waiting for wallet confirmation…</div>
      <button class="btn-reject" on:click={() => onResult('rejected')}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal {
    width: 100%;
    max-width: 340px;
    background: var(--surface);
    border: 1px solid var(--b2);
    border-radius: var(--r);
    padding: 28px 24px;
    text-align: center;
    animation: fadeIn 0.2s ease;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--s3);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }

  .tx-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .tx-desc {
    font-size: 12px;
    color: var(--t3);
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .tx-footer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .tx-hint {
    font-size: 11px;
    color: var(--t3);
  }

  .btn-reject {
    padding: 9px 20px;
    border-radius: 40px;
    border: 1px solid var(--b2);
    background: transparent;
    color: var(--t3);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    cursor: pointer;
  }

  .btn-reject:hover { border-color: var(--coral); color: var(--coral); }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
