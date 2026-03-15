<script lang="ts">
  import type { Habit } from '$lib/data/habits';

  export let habit: Habit;
  export let isSelected: boolean;
  export let onSelect: () => void;

  let popoverOpen = false;

  function togglePopover(e: MouseEvent) {
    e.stopPropagation();
    popoverOpen = !popoverOpen;
  }

  function closePopover(e: MouseEvent) {
    e.stopPropagation();
    popoverOpen = false;
  }

  function handleSelectFromPop(e: MouseEvent) {
    e.stopPropagation();
    onSelect();
  }
</script>

<svelte:window
  on:click={() => {
    if (popoverOpen) popoverOpen = false;
  }}
/>

<div
  class="habit-card"
  class:selected={isSelected}
  id="hc-{habit.id}"
  on:click|stopPropagation
>
  <!-- Accent bar -->
  <div class="hcard-bar" style="background:{habit.color}"></div>

  <div class="hcard-inner">
    <!-- Top row: icon + check -->
    <div class="hcard-top">
      <div
        class="hcard-icon"
        style={isSelected ? `background:${habit.color}22` : ''}
      >
        {habit.icon}
      </div>
      <div class="hcard-check" class:selected={isSelected}>
        {#if isSelected}
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </div>
    </div>

    <!-- Tag -->
    <div
      class="hcard-tag"
      style={isSelected
        ? `color:${habit.color};border-color:${habit.color}44;background:${habit.color}11`
        : ''}
    >
      {habit.tag}{habit.verify ? ' · verify' : ''}
      {#if habit.sponsor}
        <span class="sponsor-tag">· sponsored</span>
      {/if}
    </div>

    <!-- Name + description -->
    <div class="hcard-name">{habit.name}</div>
    <div class="hcard-desc">{habit.desc}</div>

    <!-- Sponsor reward hint -->
    {#if habit.sponsor?.rewardLabel}
      <div class="hcard-reward">
        🪙 Up to {habit.sponsor.rewardLabel} from {habit.sponsor.name}
      </div>
    {/if}

    <!-- Action buttons -->
    <div class="hcard-actions">
      <button class="hcard-select-btn" class:selected={isSelected} on:click={onSelect}>
        {isSelected ? '✓ Selected' : '+ Select'}
      </button>
      <button
        class="hcard-info-btn"
        title="Details"
        on:click={togglePopover}
      >
        ℹ
      </button>
    </div>
  </div>

  <!-- Popover — opens above the card -->
  {#if popoverOpen}
    <div class="hcard-popover" on:click|stopPropagation>
      <div
        class="pop-tag"
        style="background:{habit.color}18;color:{habit.color};border:1px solid {habit.color}33"
      >
        {habit.tag}
      </div>
      <div class="pop-name">{habit.name}</div>
      <div class="pop-desc">{habit.desc}</div>

      <div class="pop-why">
        <div class="pop-why-lbl">Why it works</div>
        <div class="pop-why-text">{habit.why}</div>
      </div>

      <div class="pop-stats">
        <div class="pop-stat">
          <div class="pop-stat-val" style="color:{habit.diffColor}">{habit.difficulty}</div>
          <div class="pop-stat-lbl">Difficulty</div>
        </div>
        <div class="pop-stat">
          <div class="pop-stat-val" style="color:{habit.color}">{habit.impact}</div>
          <div class="pop-stat-lbl">Impact</div>
        </div>
        <div class="pop-stat">
          <div class="pop-stat-val" style="font-size:12px;color:var(--t2)">{habit.tipVal}</div>
          <div class="pop-stat-lbl">{habit.tipLabel}</div>
        </div>
      </div>

      {#if habit.verify}
        <div class="pop-verify-note">
          📸 Requires verification: {habit.verify.label}
        </div>
      {/if}

      {#if habit.sponsor}
        <div class="pop-sponsor-note">
          🏷 Sponsored by <strong>{habit.sponsor.name}</strong>
          {#if habit.sponsor.rewardLabel}
            · up to {habit.sponsor.rewardLabel} in gCRC
          {/if}
        </div>
      {/if}

      <div class="pop-action-row">
        <button
          class="pop-add-btn"
          class:remove={isSelected}
          style={isSelected ? '' : `background:${habit.color}`}
          on:click={handleSelectFromPop}
        >
          {isSelected ? '− Remove habit' : '+ Add to circle'}
        </button>
        <button class="pop-close" on:click={closePopover}>✕</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .habit-card {
    position: relative;
    overflow: visible;
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--r);
    user-select: none;
    transition: border-color 0.18s, background 0.18s;
  }

  .habit-card:hover {
    border-color: var(--b2);
    background: var(--s2);
  }

  .habit-card.selected {
    border-color: var(--accent);
    background: rgba(108, 92, 231, 0.09);
  }

  .hcard-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 16px 0 0 16px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .habit-card.selected .hcard-bar {
    opacity: 1;
  }

  .hcard-inner {
    padding: 12px 12px 10px 15px;
  }

  .hcard-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .hcard-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    font-size: 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--s2);
    flex-shrink: 0;
    transition: background 0.2s;
  }

  .hcard-check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid var(--b2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.18s;
  }

  .hcard-check.selected {
    background: var(--accent);
    border-color: var(--accent);
  }

  .hcard-tag {
    display: inline-flex;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 40px;
    border: 1px solid var(--b);
    color: var(--t3);
    margin-bottom: 4px;
    transition: all 0.2s;
  }

  .sponsor-tag {
    color: var(--amber);
    margin-left: 2px;
  }

  .hcard-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--t);
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .hcard-desc {
    font-size: 11px;
    color: var(--t3);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 4px;
    transition: color 0.2s;
  }

  .habit-card:hover .hcard-desc,
  .habit-card.selected .hcard-desc {
    color: var(--t2);
  }

  .hcard-reward {
    font-size: 10px;
    color: var(--amber);
    margin-bottom: 6px;
  }

  .hcard-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .hcard-select-btn {
    flex: 1;
    padding: 7px;
    border-radius: var(--rxs);
    font-size: 11px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--b2);
    background: var(--s2);
    color: var(--t2);
  }

  .hcard-select-btn:hover {
    border-color: var(--al);
    color: var(--al);
  }

  .hcard-select-btn.selected {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  .hcard-info-btn {
    width: 30px;
    padding: 7px;
    border-radius: var(--rxs);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--b2);
    background: transparent;
    color: var(--t3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .hcard-info-btn:hover {
    border-color: var(--al);
    color: var(--al);
  }

  /* ── Popover ── */
  .hcard-popover {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(100% + 8px);
    z-index: 200;
    background: var(--s2);
    border: 1px solid var(--b2);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.45);
    animation: popIn 0.18s ease;
  }

  .hcard-popover::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 24px;
    width: 12px;
    height: 12px;
    background: var(--s2);
    border-right: 1px solid var(--b2);
    border-bottom: 1px solid var(--b2);
    transform: rotate(45deg);
  }

  .pop-tag {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 40px;
    margin-bottom: 8px;
    display: inline-flex;
  }

  .pop-name {
    font-family: 'Instrument Serif', serif;
    font-size: 17px;
    font-weight: 400;
    line-height: 1.2;
    margin-bottom: 7px;
    color: var(--t);
  }

  .pop-desc {
    font-size: 12px;
    color: var(--t2);
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .pop-why {
    background: var(--s3);
    border-radius: var(--rxs);
    padding: 10px 12px;
    margin-bottom: 10px;
  }

  .pop-why-lbl {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--t3);
    margin-bottom: 5px;
  }

  .pop-why-text {
    font-size: 11px;
    color: var(--t2);
    line-height: 1.55;
  }

  .pop-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 10px;
  }

  .pop-stat {
    background: var(--s3);
    border-radius: var(--rxs);
    padding: 8px 10px;
    text-align: center;
  }

  .pop-stat-val {
    font-size: 13px;
    font-weight: 600;
  }

  .pop-stat-lbl {
    font-size: 9px;
    color: var(--t3);
    margin-top: 2px;
  }

  .pop-verify-note {
    font-size: 11px;
    color: var(--amber);
    margin-bottom: 8px;
  }

  .pop-sponsor-note {
    font-size: 11px;
    color: var(--t2);
    margin-bottom: 10px;
    padding: 8px 10px;
    background: var(--adim);
    border: 1px solid rgba(253, 203, 110, 0.2);
    border-radius: var(--rxs);
  }

  .pop-action-row {
    display: flex;
    gap: 8px;
  }

  .pop-add-btn {
    flex: 1;
    padding: 9px;
    border-radius: var(--rxs);
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    color: #fff;
  }

  .pop-add-btn.remove {
    background: var(--s3);
    color: var(--t2);
    border: 1px solid var(--b2);
  }

  .pop-add-btn.remove:hover {
    border-color: var(--coral);
    color: var(--coral);
  }

  .pop-close {
    background: none;
    border: 1px solid var(--b);
    border-radius: var(--rxs);
    padding: 5px 10px;
    font-size: 11px;
    color: var(--t3);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .pop-close:hover {
    color: var(--t);
    border-color: var(--b2);
  }

  @keyframes popIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
