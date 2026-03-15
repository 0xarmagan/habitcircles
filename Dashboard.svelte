<script lang="ts">
  import { HABITS } from '$lib/data/habits';
  import {
    appState,
    challengeDay,
    overallScore,
    currentStreak,
    recordCompletion,
    removeCompletion,
    recordCheckIn,
    todayKey,
    dateKey
  } from '$lib/stores/state';
  import { wallet } from '$lib/stores/wallet';
  import { computeScore, habitBreakdown, heatLevel } from '$lib/utils/scoring';
  import { showToast } from '$lib/components/Toast.svelte';
  import VerifyModal from '$lib/components/VerifyModal.svelte';
  import TxModal from '$lib/components/TxModal.svelte';
  import CongratsOverlay from '$lib/components/CongratsOverlay.svelte';
  import { sendTransaction, resolvePendingTx } from '$lib/stores/wallet';
  import { buildCompletionCalldata, ATTESTATION_CONTRACT } from '$lib/utils/circles';

  export let onBack: () => void;
  export let onCheckin: () => void;

  type Tab = 'today' | 'progress' | 'leaderboard';
  let activeTab: Tab = 'today';

  let verifyModalHabit: (typeof HABITS)[0] | null = null;
  let showTxModal = false;
  let pendingTxDesc = '';
  let showCongrats = false;

  // Derived
  $: habits = $appState.selected
    .map((id) => [...HABITS, ...$appState.customHabits].find((h) => h.id === id))
    .filter(Boolean) as (typeof HABITS)[0][];

  $: today = todayKey();
  $: doneToday = $appState.completions[today] ?? {};
  $: todayDoneCount = habits.filter((h) => doneToday[h.id]).length;
  $: allDone = habits.length > 0 && habits.every((h) => doneToday[h.id]);
  $: anyUnverified = habits.some((h) => doneToday[h.id]?.verified === false);
  $: alreadyCheckedIn = $appState.checkedIn[today];

  $: ringPct = $overallScore;
  $: ringOffset = 157 - (ringPct / 100) * 157;
  $: dayBarWidth = (($challengeDay - 1) / 20) * 100;

  // Leaderboard
  $: leaderboard = (() => {
    const me = {
      addr: $wallet.address ?? '0xYou',
      pct: $overallScore,
      avatarColor: '#6c5ce7',
      isMe: true
    };
    return [...$appState.leaderboard, me].sort((a, b) => b.pct - a.pct);
  })();

  $: myRank = leaderboard.findIndex((e) => e.isMe) + 1;

  // Pool size for leaderboard card
  $: poolSize = habits.length * 12;

  $: payoutDate = (() => {
    if (!$appState.startDate) return '—';
    const d = new Date($appState.startDate);
    d.setDate(d.getDate() + 21);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();

  // Heatmap — last 7 days
  $: heatmapDays = (() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return Array.from({ length: 7 }, (_, i) => {
      const key = dateKey(-(6 - i));
      const comp = $appState.completions[key] ?? {};
      const pct =
        habits.length > 0
          ? (habits.filter((h) => comp[h.id]).length / habits.length) * 100
          : 0;
      return { label: labels[i], key, level: heatLevel(pct), pct: Math.round(pct) };
    });
  })();

  // ── Habit completion ──────────────────────────────────────
  async function handleHabitTap(habitId: string) {
    if (doneToday[habitId]) {
      removeCompletion(today, habitId);
      return;
    }

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Step 1: verification (if required)
    let verified = true;
    if (habit.verify) {
      const result = await promptVerify(habit);
      if (result === 'cancel') return;
      verified = result === 'verified';
    }

    // Step 2: on-chain attestation (if wallet connected)
    if ($wallet.address) {
      const calldata = buildCompletionCalldata({ habitId, date: today, verified });
      pendingTxDesc = `Mark "${habit.name}" complete (${verified ? 'verified' : 'self-reported'}) for ${today}`;
      showTxModal = true;
      const result = await sendTransaction({
        to: ATTESTATION_CONTRACT,
        data: calldata,
        description: pendingTxDesc
      });
      showTxModal = false;
      if (result === 'rejected') return;
    }

    recordCompletion(today, habitId, verified);
    const pts = verified ? '1.0 pt' : '0.5 pts (no proof)';
    showToast(`${habit.icon} ${habit.name} — ${pts}`, 'ok');

    // Auto-trigger congrats when all done
    if (habits.every((h) => ($appState.completions[today] ?? {})[h.id])) {
      setTimeout(() => (showCongrats = true), 600);
    }
  }

  // Verify modal promise
  let verifyResolve: ((r: 'verified' | 'unverified' | 'cancel') => void) | null = null;

  function promptVerify(
    habit: (typeof HABITS)[0]
  ): Promise<'verified' | 'unverified' | 'cancel'> {
    verifyModalHabit = habit;
    return new Promise((resolve) => {
      verifyResolve = resolve;
    });
  }

  function onVerifyResult(result: 'verified' | 'unverified' | 'cancel') {
    verifyModalHabit = null;
    if (verifyResolve) {
      verifyResolve(result);
      verifyResolve = null;
    }
  }

  // Check-in
  function handleCheckin() {
    if (!allDone || alreadyCheckedIn) return;
    showCongrats = true;
  }

  function onCongratsGoCalendar() {
    showCongrats = false;
    recordCheckIn(today);
    onCheckin();
  }

  function onCongratsStay() {
    showCongrats = false;
    recordCheckIn(today);
  }

  function shortAddr(a: string | null) {
    if (!a) return '';
    return a.length > 12 ? a.slice(0, 6) + '…' + a.slice(-4) : a;
  }
</script>

<!-- Page nav -->
<div class="page-nav">
  <button class="page-nav-btn" on:click={onBack}>← Back</button>
  <span class="page-nav-center">Day {$challengeDay} / 21</span>
  <button class="page-nav-btn" on:click={() => (activeTab = 'progress')}>Progress →</button>
</div>

<div class="dashboard">
  <!-- Tabs -->
  <div class="tabs">
    {#each ['today', 'progress', 'leaderboard'] as t}
      <div class="tab" class:active={activeTab === t} on:click={() => (activeTab = t)}>
        {t.charAt(0).toUpperCase() + t.slice(1)}
      </div>
    {/each}
  </div>

  <!-- ══ TODAY ══ -->
  {#if activeTab === 'today'}
    <!-- Hero ring banner -->
    <div class="hero-banner">
      <div class="hero-top">
        <div class="ring-wrap">
          <svg viewBox="0 0 60 60">
            <circle class="rbg" cx="30" cy="30" r="25" />
            <circle
              class="rfill"
              cx="30"
              cy="30"
              r="25"
              stroke="url(#rg)"
              stroke-dasharray="157"
              stroke-dashoffset={ringOffset}
            />
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#6c5ce7" />
                <stop offset="100%" stop-color="#00cec9" />
              </linearGradient>
            </defs>
          </svg>
          <div class="rlabel">{ringPct}%</div>
        </div>
        <div class="hero-info">
          <h3>Day {$challengeDay} of 21</h3>
          <p>
            {ringPct >= 80
              ? 'Top form — your CRC rewards look strong.'
              : ringPct >= 50
              ? 'Good pace. A full day lifts you up the board.'
              : 'Every completed habit counts toward your CRC score.'}
          </p>
        </div>
      </div>
      <div class="day-bar-wrap">
        <div class="day-bar">
          <div class="day-bar-fill" style="width:{dayBarWidth}%"></div>
        </div>
        <div class="day-bar-lbl">Day {$challengeDay} of 21</div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="sval cg">{$currentStreak}</div>
        <div class="slbl">Streak</div>
      </div>
      <div class="stat-card">
        <div class="sval cv">{todayDoneCount}/{habits.length}</div>
        <div class="slbl">Today</div>
      </div>
      <div class="stat-card">
        <div class="sval ca">{$overallScore}%</div>
        <div class="slbl">Score</div>
      </div>
    </div>

    <!-- Reward strip -->
    <div class="reward-strip">
      <div class="rs-icon">🪙</div>
      <div class="rs-text">
        <div class="rs-title">CRC Reward Pool</div>
        <div class="rs-sub">{22 - $challengeDay} days remaining</div>
      </div>
      <div class="rs-badge">{$overallScore}%</div>
    </div>

    <!-- Habit list header -->
    <div class="today-hdr">
      <h2>Today's habits</h2>
      <span class="today-date">
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>

    <!-- Habit rows -->
    <div class="habit-list">
      {#each habits as habit (habit.id)}
        {@const completion = doneToday[habit.id]}
        {@const isDone = !!completion}
        {@const isVerified = isDone && completion.verified !== false}
        {@const isUnverified = isDone && completion.verified === false}
        {@const bd = habitBreakdown($appState.completions, habit.id, $challengeDay)}

        <div
          class="habit-row"
          class:done={isDone}
          class:unverified={isUnverified}
          on:click={() => handleHabitTap(habit.id)}
        >
          <div
            class="hr-icon"
            style={isDone ? `background:${habit.color}18` : ''}
          >
            {habit.icon}
          </div>
          <div class="hr-info">
            <div class="hr-name">{habit.name}</div>
            <div class="hr-meta">
              <span class="hr-tag" style="color:{habit.color}">{habit.tag}</span>
              <span class="hr-sub" style={isUnverified ? 'color:var(--al)' : ''}>
                {isDone
                  ? isVerified
                    ? 'Done · verified ✓'
                    : 'Done · no proof (0.5 pts)'
                  : `${bd.days}/${$challengeDay} days`}
              </span>
            </div>
          </div>
          <div class="hr-bar">
            <div class="hr-bar-fill" style="width:{bd.pct}%;background:{habit.color}"></div>
          </div>
          <div class="chk-row">
            {#if habit.verify && !isDone}
              <span class="verify-badge">📸 verify</span>
            {/if}
            {#if isUnverified}
              <span class="unverified-badge">½ pt</span>
            {/if}
            <button
              class="chkbtn"
              style={isDone
                ? isVerified
                  ? `background:${habit.color};border-color:${habit.color}`
                  : `background:rgba(162,155,254,.25);border-color:var(--al);color:var(--al)`
                : ''}
              on:click|stopPropagation={() => handleHabitTap(habit.id)}
            >
              {isVerified ? '✓' : isDone ? '½' : ''}
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Sticky check-in footer -->
    <div class="checkin-footer">
      <div class="checkin-footer-inner">
        <button
          class="checkin-big-btn"
          class:all-done={allDone && !alreadyCheckedIn}
          disabled={!allDone || alreadyCheckedIn}
          on:click={handleCheckin}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M5.5 9L8 11.5L12.5 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>
            {#if alreadyCheckedIn}
              Day checked in ✓
            {:else if allDone}
              {anyUnverified ? 'Check in (some habits unverified)' : 'Check in — all habits done!'}
            {:else}
              {habits.length - todayDoneCount === habits.length
                ? 'Complete habits to check in'
                : `${habits.length - todayDoneCount} habit${habits.length - todayDoneCount !== 1 ? 's' : ''} left to check in`}
            {/if}
          </span>
        </button>
        <div class="checkin-hint">
          {#if alreadyCheckedIn}
            See you tomorrow!
          {:else if allDone && anyUnverified}
            Unverified habits count as 0.5 pts each
          {:else if allDone}
            Tap to record your day and view the calendar
          {:else}
            {todayDoneCount} of {habits.length} done today
          {/if}
        </div>
      </div>
    </div>

  <!-- ══ PROGRESS ══ -->
  {:else if activeTab === 'progress'}
    <div class="section-lbl">Last 7 days</div>
    <div class="hmhdr">
      {#each heatmapDays as day}
        <div class="hm-day">{day.label}</div>
      {/each}
    </div>
    <div class="hm-grid">
      {#each heatmapDays as day}
        <div class="hm-cell" data-p={day.level} title="{day.pct}% on {day.key}"></div>
      {/each}
    </div>

    <div class="section-lbl" style="margin-top:18px">Per habit</div>
    <div class="prog-grid">
      {#each habits as habit (habit.id)}
        {@const bd = habitBreakdown($appState.completions, habit.id, $challengeDay)}
        <div class="prog-item">
          <div class="prog-top">
            <div class="prog-icon">{habit.icon}</div>
            <div class="prog-name">{habit.name}</div>
            <div class="prog-pct" style="color:{habit.color}">{bd.pct}%</div>
          </div>
          <div class="prog-bar">
            <div class="prog-bar-fill" style="width:{bd.pct}%;background:{habit.color}"></div>
          </div>
          {#if bd.unverified > 0}
            <div class="prog-split">{bd.verified} verified · {bd.unverified} self-reported</div>
          {/if}
        </div>
      {/each}
    </div>

  <!-- ══ LEADERBOARD ══ -->
  {:else}
    <div class="bot-card">
      <div class="bot-hdr">
        <div class="bot-dot"></div>
        <div>
          <div class="bot-title">Arb Bot — Active</div>
          <div class="bot-sub">friendly_arb_bot · Gnosis Chain</div>
        </div>
      </div>
      <div class="bot-meta">
        <div class="bot-f"><div class="bot-fl">Pool</div><div class="bot-fv">{poolSize} CRC</div></div>
        <div class="bot-f"><div class="bot-fl">Payout</div><div class="bot-fv">{payoutDate}</div></div>
        <div class="bot-f"><div class="bot-fl">Recipients</div><div class="bot-fv">Top 3</div></div>
        <div class="bot-f"><div class="bot-fl">Your rank</div><div class="bot-fv">#{myRank}</div></div>
      </div>
    </div>

    <div class="lb-list">
      {#each leaderboard.slice(0, 6) as entry, i}
        {@const rank = i + 1}
        <div class="lb-row" class:me={entry.isMe}>
          <div class="lb-rank" class:top={rank <= 3}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
          </div>
          <div
            class="lb-av"
            style="background:{entry.avatarColor}22;color:{entry.avatarColor}"
          >
            {entry.isMe ? 'ME' : entry.addr.slice(2, 4).toUpperCase()}
          </div>
          <div class="lb-name">
            {entry.isMe ? `You (${shortAddr($wallet.address)})` : entry.addr}
          </div>
          <div class="lb-r">
            <div class="lb-pct">{entry.pct}%</div>
            {#if rank <= 3}<div class="lb-crc">earns CRC</div>{/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modals -->
{#if verifyModalHabit}
  <VerifyModal habit={verifyModalHabit} onResult={onVerifyResult} />
{/if}

{#if showTxModal}
  <TxModal description={pendingTxDesc} onResult={(r) => resolvePendingTx(r)} />
{/if}

{#if showCongrats}
  <CongratsOverlay
    dayN={$challengeDay}
    streak={$currentStreak}
    todayDone={todayDoneCount}
    totalHabits={habits.length}
    score={$overallScore}
    {anyUnverified}
    onGoCalendar={onCongratsGoCalendar}
    onStay={onCongratsStay}
  />
{/if}

<style>
  .dashboard {
    padding: 16px 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Hero */
  .hero-banner {
    border-radius: var(--r);
    padding: 18px 20px 15px;
    margin-bottom: 14px;
    position: relative;
    overflow: hidden;
    background: var(--surface);
    border: 1px solid var(--b);
  }

  .hero-banner::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(108, 92, 231, 0.14) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
  }

  .ring-wrap {
    position: relative;
    width: 60px;
    height: 60px;
    flex-shrink: 0;
  }

  .ring-wrap svg {
    width: 60px;
    height: 60px;
    transform: rotate(-90deg);
  }

  .rbg {
    fill: none;
    stroke: var(--s3);
    stroke-width: 5;
  }

  .rfill {
    fill: none;
    stroke-width: 5;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.7s ease;
  }

  .rlabel {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Instrument Serif', serif;
    font-size: 15px;
    color: var(--t);
  }

  .hero-info h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 3px;
  }

  .hero-info p {
    font-size: 12px;
    color: var(--t2);
    line-height: 1.5;
  }

  .day-bar-wrap {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .day-bar {
    flex: 1;
    height: 3px;
    background: var(--s3);
    border-radius: 2px;
    overflow: hidden;
  }

  .day-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
    background: linear-gradient(90deg, var(--accent), var(--al));
  }

  .day-bar-lbl {
    font-size: 10px;
    color: var(--t3);
    white-space: nowrap;
  }

  /* Stats */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--rsm);
    padding: 12px;
    text-align: center;
  }

  .sval {
    font-family: 'Instrument Serif', serif;
    font-size: 24px;
    font-weight: 400;
    line-height: 1;
  }

  .sval.cg { color: var(--green2); }
  .sval.ca { color: var(--amber); }
  .sval.cv { color: var(--al); }
  .slbl { font-size: 10px; color: var(--t3); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.3px; }

  /* Reward strip */
  .reward-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface);
    border: 1px solid rgba(253, 203, 110, 0.2);
    border-radius: var(--rsm);
    padding: 11px 14px;
    margin-bottom: 18px;
  }

  .rs-icon { font-size: 19px; flex-shrink: 0; }
  .rs-text { flex: 1; }
  .rs-title { font-size: 13px; font-weight: 600; }
  .rs-sub { font-size: 11px; color: var(--t3); margin-top: 1px; }
  .rs-badge { font-size: 11px; font-weight: 600; color: var(--amber); background: var(--adim); border: 1px solid rgba(253,203,110,.2); border-radius: 40px; padding: 4px 10px; }

  /* Today header */
  .today-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .today-hdr h2 { font-size: 11px; font-weight: 600; color: var(--t3); letter-spacing: 0.8px; text-transform: uppercase; }
  .today-date { font-size: 11px; color: var(--t3); }

  /* Habit list */
  .habit-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 0; }

  .habit-row {
    display: flex;
    align-items: center;
    gap: 11px;
    background: var(--surface);
    border: 1px solid var(--b);
    border-radius: var(--r);
    padding: 12px 13px;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .habit-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .habit-row:hover { border-color: var(--b2); }
  .habit-row.done { border-color: rgba(0, 206, 201, 0.22); background: var(--gdim); }
  .habit-row.done::before { opacity: 1; background: var(--green); }
  .habit-row.unverified { border-color: rgba(162, 155, 254, 0.25); }
  .habit-row.unverified::before { opacity: 1; background: var(--al); }

  .hr-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--s2); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .hr-info { flex: 1; min-width: 0; }
  .hr-name { font-size: 13px; font-weight: 500; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hr-meta { display: flex; align-items: center; gap: 7px; }
  .hr-tag { font-size: 10px; }
  .hr-sub { font-size: 11px; color: var(--t3); }
  .habit-row.done .hr-sub { color: var(--green2); }

  .hr-bar { width: 50px; height: 3px; background: var(--s3); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
  .hr-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }

  .chk-row { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .verify-badge { font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 40px; background: rgba(253,203,110,.12); color: var(--amber); border: 1px solid rgba(253,203,110,.25); white-space: nowrap; }
  .unverified-badge { font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 40px; background: rgba(162,155,254,.12); color: var(--al); border: 1px solid rgba(162,155,254,.25); white-space: nowrap; }

  .chkbtn { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid var(--b2); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 12px; color: var(--t3); }
  .chkbtn:hover { border-color: var(--green); color: var(--green); }
  .habit-row.done .chkbtn { background: var(--green); border-color: var(--green); color: #0b0d11; }

  /* Check-in footer */
  .checkin-footer {
    position: sticky;
    bottom: 0;
    z-index: 50;
    background: linear-gradient(to top, var(--bg) 60%, transparent);
    padding: 16px 0 24px;
    margin-top: 12px;
  }

  .checkin-footer-inner {}

  .checkin-big-btn {
    width: 100%;
    padding: 17px;
    border-radius: var(--r);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--accent);
    color: #fff;
    box-shadow: 0 4px 24px rgba(108, 92, 231, 0.35);
  }

  .checkin-big-btn:hover:not(:disabled) {
    background: #7c6ef7;
    transform: translateY(-1px);
  }

  .checkin-big-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }

  .checkin-big-btn.all-done {
    background: linear-gradient(135deg, var(--accent), var(--green));
    box-shadow: 0 4px 24px rgba(0, 206, 201, 0.3);
  }

  .checkin-hint { text-align: center; font-size: 11px; color: var(--t3); margin-top: 8px; }

  /* Progress tab */
  .section-lbl { font-size: 11px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 11px; }
  .hmhdr { display: flex; justify-content: space-between; margin-bottom: 7px; }
  .hm-day { font-size: 10px; color: var(--t3); text-align: center; flex: 1; }
  .hm-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 0; }
  .hm-cell { aspect-ratio: 1; border-radius: 5px; background: var(--s2); transition: all 0.2s; }
  :global(.hm-cell[data-p="low"]) { background: rgba(0,206,201,.18); }
  :global(.hm-cell[data-p="mid"]) { background: rgba(0,206,201,.45); }
  :global(.hm-cell[data-p="high"]) { background: var(--green); }

  .prog-grid { display: flex; flex-direction: column; gap: 8px; }
  .prog-item { background: var(--surface); border: 1px solid var(--b); border-radius: var(--rsm); padding: 12px 14px; }
  .prog-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .prog-icon { font-size: 17px; width: 26px; text-align: center; }
  .prog-name { flex: 1; font-size: 13px; font-weight: 500; }
  .prog-pct { font-size: 13px; font-weight: 600; }
  .prog-bar { height: 4px; background: var(--s3); border-radius: 3px; overflow: hidden; }
  .prog-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .prog-split { font-size: 10px; color: var(--al); margin-top: 5px; }

  /* Leaderboard */
  .bot-card { background: var(--surface); border: 1px solid var(--b); border-radius: var(--r); padding: 15px 17px; margin-bottom: 15px; }
  .bot-hdr { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
  .bot-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green2); box-shadow: 0 0 7px var(--green2); animation: blink 2.2s infinite; }
  .bot-title { font-size: 13px; font-weight: 600; }
  .bot-sub { font-size: 11px; color: var(--t3); margin-top: 1px; }
  .bot-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .bot-f { background: var(--s2); border-radius: var(--rxs); padding: 9px 11px; }
  .bot-fl { font-size: 10px; color: var(--t3); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 3px; }
  .bot-fv { font-size: 14px; font-weight: 500; }

  .lb-list { display: flex; flex-direction: column; gap: 6px; }
  .lb-row { display: flex; align-items: center; gap: 11px; background: var(--surface); border: 1px solid var(--b); border-radius: var(--rsm); padding: 11px 13px; }
  .lb-row.me { border-color: rgba(108,92,231,.4); background: rgba(108,92,231,.06); }
  .lb-rank { font-size: 13px; font-weight: 600; width: 20px; color: var(--t3); text-align: center; }
  .lb-rank.top { color: var(--amber); }
  .lb-av { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
  .lb-name { flex: 1; font-size: 13px; font-weight: 500; }
  .lb-r { text-align: right; }
  .lb-pct { font-size: 14px; font-weight: 600; color: var(--green2); }
  .lb-crc { font-size: 10px; color: var(--amber); }
</style>
