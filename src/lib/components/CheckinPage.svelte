<script lang="ts">
  import { appState, challengeDay } from '$lib/stores/state';

  export let onBack: () => void;

  // Build a 21-day calendar view
  $: days = Array.from({ length: 21 }, (_, i) => {
    const dayNum = i + 1;
    const date = $appState.startDate
      ? (() => {
          const d = new Date($appState.startDate + 'T12:00:00');
          d.setDate(d.getDate() + i);
          return d;
        })()
      : null;
    const key = date ? date.toISOString().split('T')[0] : null;
    const checkedIn = key ? !!$appState.checkedIn[key] : false;
    const completions = key ? $appState.completions[key] ?? {} : {};
    const doneCount = $appState.selected.filter((id) => completions[id]).length;
    const isToday = dayNum === $challengeDay;
    const isFuture = dayNum > $challengeDay;

    return { dayNum, date, key, checkedIn, doneCount, isToday, isFuture };
  });

  function fmt(d: Date | null) {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<div class="page-nav">
  <button class="page-nav-btn" on:click={onBack}>← Back</button>
  <span class="page-nav-center">21-Day Calendar</span>
  <span class="page-nav-btn" style="opacity:0" aria-hidden="true">·</span>
</div>

<div class="checkin-page">
  <div class="cal-header">
    <h2>Your 21-day journey</h2>
    <p>Day {$challengeDay} of 21 · {$appState.selected.length} habits</p>
  </div>

  <div class="cal-grid">
    {#each days as day}
      <div
        class="cal-cell"
        class:today={day.isToday}
        class:done={day.checkedIn}
        class:future={day.isFuture}
        class:partial={!day.checkedIn && !day.isFuture && day.doneCount > 0}
      >
        <div class="cal-num">{day.dayNum}</div>
        {#if day.checkedIn}
          <div class="cal-icon">✓</div>
        {:else if day.isToday}
          <div class="cal-icon today-dot"></div>
        {:else if !day.isFuture && day.doneCount > 0}
          <div class="cal-icon partial-dot"></div>
        {/if}
        {#if day.date && !day.isFuture}
          <div class="cal-date">{fmt(day.date)}</div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="legend">
    <div class="leg-item"><div class="leg-dot done"></div> Checked in</div>
    <div class="leg-item"><div class="leg-dot partial"></div> Partial</div>
    <div class="leg-item"><div class="leg-dot future"></div> Upcoming</div>
  </div>

  <div class="summary-card">
    <div class="sum-row">
      <span class="sum-lbl">Check-ins</span>
      <span class="sum-val">{Object.keys($appState.checkedIn).length} / {$challengeDay}</span>
    </div>
    <div class="sum-row">
      <span class="sum-lbl">Days remaining</span>
      <span class="sum-val">{21 - $challengeDay}</span>
    </div>
  </div>
</div>

<style>
  .checkin-page {
    max-width: 560px;
    margin: 0 auto;
    padding: 20px 20px 60px;
  }

  .cal-header {
    margin-bottom: 20px;
  }

  .cal-header h2 {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    font-weight: 400;
    margin-bottom: 4px;
  }

  .cal-header p {
    font-size: 13px;
    color: var(--t3);
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    margin-bottom: 16px;
  }

  .cal-cell {
    aspect-ratio: 1;
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--rsm);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    position: relative;
  }

  .cal-cell.done {
    background: rgba(0, 206, 201, 0.12);
    border-color: rgba(0, 206, 201, 0.3);
  }

  .cal-cell.today {
    border-color: var(--accent);
    background: rgba(108, 92, 231, 0.12);
  }

  .cal-cell.future {
    opacity: 0.35;
  }

  .cal-cell.partial {
    background: rgba(253, 203, 110, 0.08);
    border-color: rgba(253, 203, 110, 0.2);
  }

  .cal-num {
    font-size: 11px;
    font-weight: 600;
    color: var(--t3);
  }

  .cal-cell.done .cal-num { color: var(--green2); }
  .cal-cell.today .cal-num { color: var(--al); }

  .cal-icon {
    font-size: 12px;
    color: var(--green2);
    font-weight: 700;
  }

  .today-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    font-size: 0;
    animation: blink 2s infinite;
  }

  .partial-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--amber);
    font-size: 0;
  }

  .cal-date {
    font-size: 8px;
    color: var(--t3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
    text-align: center;
  }

  .legend {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .leg-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--t3);
  }

  .leg-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  .leg-dot.done { background: rgba(0, 206, 201, 0.4); }
  .leg-dot.partial { background: rgba(253, 203, 110, 0.4); }
  .leg-dot.future { background: var(--s3); }

  .summary-card {
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--r);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sum-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .sum-lbl { color: var(--t2); }
  .sum-val { font-weight: 600; color: var(--green2); }
</style>
