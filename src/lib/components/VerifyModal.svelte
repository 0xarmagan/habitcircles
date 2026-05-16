<script lang="ts">
  import type { Habit } from '$lib/data/habits';

  export let habit: Habit;
  export let onResult: (result: 'verified' | 'unverified' | 'cancel') => void;

  let fileSelected = false;

  function handleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    fileSelected = !!(input.files && input.files.length > 0);
  }
</script>

<div class="modal-backdrop" on:click={() => onResult('cancel')} role="presentation">
  <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
    <div class="modal-hdr">
      <div class="modal-icon">{habit.icon}</div>
      <div class="modal-title">
        <div class="modal-name">{habit.name}</div>
        <div class="modal-sub">Optional verification</div>
      </div>
      <button class="modal-close" on:click={() => onResult('cancel')}>✕</button>
    </div>

    {#if habit.verify}
      <div class="verify-box">
        <div class="verify-lbl">📸 {habit.verify.label}</div>
        <div class="verify-hint">{habit.verify.hint}</div>

        <label class="file-label" class:has-file={fileSelected}>
          <input type="file" accept="image/*" on:change={handleFile} />
          {fileSelected ? '✓ Photo selected' : 'Choose photo'}
        </label>
      </div>
    {/if}

    <div class="score-info">
      <div class="score-row">
        <span class="score-badge verified">1.0 pt</span>
        <span>With photo verification</span>
      </div>
      <div class="score-row">
        <span class="score-badge unverified">0.5 pts</span>
        <span>Self-reported, no photo</span>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-skip" on:click={() => onResult('unverified')}>
        Done (no proof)
      </button>
      <button
        class="btn-verify"
        disabled={!fileSelected}
        on:click={() => onResult('verified')}
      >
        Submit with photo
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 500;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .modal {
    width: 100%;
    max-width: 560px;
    background: var(--surface);
    border: 1px solid var(--b2);
    border-radius: var(--r) var(--r) 0 0;
    padding: 24px 20px 32px;
    animation: slideUp 0.22s ease;
  }

  .modal-hdr {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .modal-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .modal-title { flex: 1; }
  .modal-name { font-size: 15px; font-weight: 600; }
  .modal-sub { font-size: 12px; color: var(--t3); margin-top: 2px; }

  .modal-close {
    background: none;
    border: 1px solid var(--b2);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 12px;
    color: var(--t3);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .verify-box {
    background: var(--s2);
    border: 1px solid var(--b);
    border-radius: var(--rsm);
    padding: 14px 16px;
    margin-bottom: 16px;
  }

  .verify-lbl { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .verify-hint { font-size: 12px; color: var(--t3); margin-bottom: 12px; line-height: 1.5; }

  .file-label {
    display: block;
    text-align: center;
    padding: 11px;
    border-radius: var(--rsm);
    border: 1.5px dashed var(--b2);
    font-size: 13px;
    font-weight: 600;
    color: var(--t2);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .file-label:hover { border-color: var(--accent); color: var(--al); }
  .file-label.has-file { border-color: var(--green); color: var(--green2); border-style: solid; }
  .file-label input { display: none; }

  .score-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .score-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--t2);
  }

  .score-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 40px;
  }

  .score-badge.verified { background: rgba(0, 206, 201, 0.15); color: var(--green2); }
  .score-badge.unverified { background: rgba(162, 155, 254, 0.15); color: var(--al); }

  .modal-footer { display: flex; gap: 10px; }

  .btn-skip {
    flex: 1;
    padding: 13px;
    border-radius: var(--r);
    border: 1px solid var(--b2);
    background: transparent;
    color: var(--t2);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
  }

  .btn-verify {
    flex: 2;
    padding: 13px;
    border-radius: var(--r);
    border: none;
    background: var(--green);
    color: #0b0d11;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-verify:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-verify:hover:not(:disabled) { background: var(--green2); }
</style>
