<script lang="ts">
  import { wallet, isConnected, connectDevWallet } from '$lib/stores/wallet';

  function handleWalletClick() {
    if (!$isConnected && !$wallet.miniappMode) {
      connectDevWallet();
    }
  }

  function shortAddr(a: string | null) {
    if (!a) return '';
    return a.length > 12 ? a.slice(0, 6) + '…' + a.slice(-4) : a;
  }
</script>

<nav class="nav">
  <div class="nav-logo">
    <div class="nav-mark">HC</div>
    <div class="nav-text">Habit<span>Circles</span></div>
  </div>

  <button class="wallet-btn" on:click={handleWalletClick}>
    <div class="wdot" class:on={$isConnected}></div>
    {#if $isConnected}
      {shortAddr($wallet.address)}
    {:else if $wallet.miniappMode}
      Connecting…
    {:else}
      Connect (dev)
    {/if}
  </button>
</nav>
