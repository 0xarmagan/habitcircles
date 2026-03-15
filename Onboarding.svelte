<script lang="ts">
  import { HABITS, EMOJI_LIST, CUSTOM_TAGS, TAG_COLORS, type Habit } from '$lib/data/habits';
  import {
    appState,
    selectHabit,
    deselectHabit,
    addCustomHabit,
    startChallenge
  } from '$lib/stores/state';
  import { showToast } from '$lib/components/Toast.svelte';
  import HabitCard from '$lib/components/HabitCard.svelte';
  import CustomHabitModal from '$lib/components/CustomHabitModal.svelte';

  export let onStart: () => void;

  let showCustomModal = false;

  // All habits = built-in pool + user's custom habits
  $: allHabits = [...HABITS, ...$appState.customHabits];
  $: selected = $appState.selected;
  $: canStart = selected.length >= 1;

  function handleSelect(id: string) {
    if (selected.includes(id)) {
      deselectHabit(id);
    } else if (selected.length >= 10) {
      showToast('Maximum 10 habits');
    } else {
      selectHabit(id);
      const h = allHabits.find((x) => x.id === id);
      if (h) showToast(`${h.icon} Added to your circle`, 'ok');
    }
  }

  function handleStart() {
    if (!canStart) return;
    startChallenge();
    onStart();
  }

  function handleCustomAdded(habit: Habit) {
    addCustomHabit(habit);
    showCustomModal = false;
    showToast(`${habit.icon} ${habit.name} added!`, 'ok');
  }
</script>

<!-- Page nav -->
<div class="page-nav">
  <button class="page-nav-btn" disabled>← Back</button>
  <span class="page-nav-center">Step 1 of 3</span>
  <button class="page-nav-btn" disabled={!canStart} on:click={handleStart}>
    Next →
  </button>
</div>

<div class="onboard">
  <!-- Hero -->
  <div class="onboard-hero">
    <h1>21 days.<br /><em>Earn Circles.</em></h1>
    <p>
      Choose daily rituals, show up every day, and climb the leaderboard.
      The arbitrage bot distributes <strong>CRC rewards</strong> to the top
      performers at the end.
    </p>
  </div>

  <!-- Steps strip -->
  <div class="steps-strip">
    <div class="step active">
      <div class="step-num">1</div>
      <div class="step-label">Pick habits</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-label">Daily check-in</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-label">Earn CRC</div>
    </div>
  </div>

  <!-- Section header -->
  <div class="section-head">
    <h2>Choose your habits</h2>
    <span>+ to select · ℹ to learn more</span>
  </div>

  <!-- Habit grid -->
  <div class="habit-grid">
    {#each allHabits as habit (habit.id)}
      <HabitCard
        {habit}
        isSelected={selected.includes(habit.id)}
        onSelect={() => handleSelect(habit.id)}
      />
    {/each}
  </div>

  <!-- Add My Habit button -->
  <div class="add-custom-wrap">
    <button class="add-custom-btn" on:click={() => (showCustomModal = true)}>
      <span>✨</span> Add my own habit
    </button>
  </div>

  <!-- Tally -->
  <div class="select-tally">
    <div class="tally-left">
      <strong>{selected.length}</strong> / 10 selected
    </div>
    <div class="tally-dots">
      {#each Array(10) as _, i}
        <div class="tdot" class:on={i < selected.length}></div>
      {/each}
    </div>
  </div>

  <!-- CTA -->
  <button class="btn-primary" disabled={!canStart} on:click={handleStart}>
    Begin 21-Day Challenge
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</div>

<!-- Custom habit modal -->
{#if showCustomModal}
  <CustomHabitModal
    onAdd={handleCustomAdded}
    onCancel={() => (showCustomModal = false)}
  />
{/if}

<style>
  .onboard {
    max-width: 560px;
    margin: 0 auto;
    padding: 28px 20px 60px;
  }

  .onboard-hero {
    margin-bottom: 28px;
  }

  .onboard-hero h1 {
    font-family: 'Instrument Serif', serif;
    font-size: 36px;
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.5px;
    margin-bottom: 10px;
  }

  .onboard-hero h1 em {
    color: var(--al);
    font-style: italic;
  }

  .onboard-hero p {
    font-size: 14px;
    color: var(--t2);
    line-height: 1.65;
    max-width: 420px;
  }

  .onboard-hero p strong {
    color: var(--amber);
    font-weight: 500;
  }

  .steps-strip {
    display: flex;
    margin-bottom: 28px;
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--r);
    overflow: hidden;
  }

  .step {
    flex: 1;
    padding: 12px 8px;
    text-align: center;
    border-right: 1px solid var(--b);
  }

  .step:last-child {
    border-right: none;
  }

  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 600;
    background: var(--s3);
    color: var(--t3);
    margin-bottom: 4px;
  }

  .step-label {
    font-size: 10px;
    color: var(--t3);
  }

  .step.active .step-num {
    background: var(--accent);
    color: #fff;
  }

  .step.active .step-label {
    color: var(--t2);
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .section-head h2 {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: var(--t3);
  }

  .section-head span {
    font-size: 11px;
    color: var(--t3);
  }

  .habit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }

  .add-custom-wrap {
    margin-bottom: 20px;
  }

  .add-custom-btn {
    width: 100%;
    padding: 14px 16px;
    border-radius: var(--r);
    background: var(--surface);
    border: 1.5px dashed var(--b2);
    color: var(--t2);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }

  .add-custom-btn:hover {
    border-color: var(--al);
    color: var(--al);
  }

  .add-custom-btn span {
    font-size: 18px;
  }

  .select-tally {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 11px 15px;
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--rsm);
  }

  .tally-left {
    font-size: 13px;
    color: var(--t2);
  }

  .tally-left strong {
    color: var(--al);
    font-weight: 600;
  }

  .tally-dots {
    display: flex;
    gap: 5px;
  }

  .tdot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--s3);
    transition: all 0.2s;
  }

  .tdot.on {
    background: var(--accent);
  }
</style>
