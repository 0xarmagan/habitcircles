<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  type ToastType = 'ok' | 'warn' | 'error';

  interface ToastItem {
    id: number;
    msg: string;
    type: ToastType;
  }

  const toasts = writable<ToastItem[]>([]);
  let counter = 0;

  export function showToast(msg: string, type: ToastType = 'ok') {
    const id = ++counter;
    toasts.update((t) => [...t, { id, msg, type }]);
    setTimeout(() => toasts.update((t) => t.filter((x) => x.id !== id)), 3000);
  }
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';
</script>

<div class="toast-stack">
  {#each $toasts as t (t.id)}
    <div
      class="toast"
      class:ok={t.type === 'ok'}
      class:warn={t.type === 'warn'}
      class:error={t.type === 'error'}
      transition:fly={{ y: 16, duration: 220 }}
    >
      {t.msg}
    </div>
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }

  .toast {
    padding: 12px 20px;
    border-radius: 40px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    backdrop-filter: blur(12px);
    border: 1px solid var(--b2);
    background: var(--s2);
    color: var(--t);
  }

  .toast.ok { border-color: rgba(0, 206, 201, 0.3); color: var(--green2); }
  .toast.warn { border-color: rgba(253, 203, 110, 0.3); color: var(--amber); }
  .toast.error { border-color: rgba(225, 112, 85, 0.3); color: var(--coral); }
</style>
