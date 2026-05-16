<script lang="ts">
  export let dayN: number;
  export let streak: number;
  export let todayDone: number;
  export let totalHabits: number;
  export let score: number;
  export let anyUnverified: boolean;
  export let onGoCalendar: () => void;
  export let onStay: () => void;
</script>

<div class="overlay" role="presentation">
  <div class="overlay-card">
    <div class="confetti-row">🎉</div>

    <h2 class="congrats-title">Day {dayN} complete!</h2>
    <p class="congrats-sub">
      {#if anyUnverified}
        {todayDone}/{totalHabits} habits done · some unverified
      {:else}
        All {totalHabits} habits completed with full points!
      {/if}
    </p>

    <div class="stats-grid">
      <div class="stat">
        <div class="stat-val">{streak}</div>
        <div class="stat-lbl">Day streak</div>
      </div>
      <div class="stat">
        <div class="stat-val">{score}%</div>
        <div class="stat-lbl">Overall score</div>
      </div>
      <div class="stat">
        <div class="stat-val">{21 - dayN}</div>
        <div class="stat-lbl">Days left</div>
      </div>
    </div>

    {#if anyUnverified}
      <div class="verify-nudge">
        Tip: verified completions earn <strong>2×</strong> the points. Upload photos next time!
      </div>
    {/if}

    <div class="footer-btns">
      <button class="btn-stay" on:click={onStay}>Stay on dashboard</button>
      <button class="btn-calendar" on:click={onGoCalendar}>View calendar →</button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.25s ease;
  }

  .overlay-card {
    width: 100%;
    max-width: 380px;
    background: var(--surface);
    border: 1px solid var(--b2);
    border-radius: var(--r);
    padding: 28px 24px 24px;
    text-align: center;
    animation: slideUp 0.3s ease;
  }

  .confetti-row {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .congrats-title {
    font-family: 'Instrument Serif', serif;
    font-size: 26px;
    font-weight: 400;
    margin-bottom: 6px;
  }

  .congrats-sub {
    font-size: 14px;
    color: var(--t2);
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 18px;
  }

  .stat {
    background: var(--s2);
    border: 1px solid var(--b);
    border-radius: var(--rsm);
    padding: 12px 8px;
  }

  .stat-val {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    color: var(--green2);
    margin-bottom: 3px;
  }

  .stat-lbl {
    font-size: 10px;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .verify-nudge {
    font-size: 12px;
    color: var(--amber);
    background: var(--adim);
    border: 1px solid rgba(253, 203, 110, 0.2);
    border-radius: var(--rsm);
    padding: 10px 12px;
    margin-bottom: 18px;
    text-align: left;
    line-height: 1.5;
  }

  .footer-btns {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .btn-calendar {
    padding: 14px;
    border-radius: var(--r);
    border: none;
    background: linear-gradient(135deg, var(--accent), var(--green));
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-calendar:hover { opacity: 0.9; }

  .btn-stay {
    padding: 12px;
    border-radius: var(--r);
    border: 1px solid var(--b2);
    background: transparent;
    color: var(--t2);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
  }
</style>
