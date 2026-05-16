<script lang="ts">
  import { CUSTOM_TAGS, TAG_COLORS, EMOJI_LIST, type Habit } from '$lib/data/habits';

  export let onAdd: (habit: Habit) => void;
  export let onCancel: () => void;

  let name = '';
  let desc = '';
  let icon = '🌟';
  let tag: string = CUSTOM_TAGS[0];
  let requireVerify = false;
  let verifyLabel = '';
  let showEmojiPicker = false;

  $: valid = name.trim().length >= 3;

  function handleAdd() {
    if (!valid) return;
    const habit: Habit = {
      id: 'custom_' + Date.now(),
      icon,
      name: name.trim(),
      tag,
      color: TAG_COLORS[tag] ?? '#a29bfe',
      desc: desc.trim() || name.trim(),
      why: 'A personal habit you chose.',
      difficulty: 'Custom',
      diffColor: '#a29bfe',
      impact: 'Personal',
      tipLabel: 'Your habit',
      tipVal: 'Custom',
      verify: requireVerify && verifyLabel.trim()
        ? { type: 'upload', label: verifyLabel.trim(), hint: 'Upload a photo or screenshot as proof.' }
        : null,
      isCustom: true
    };
    onAdd(habit);
  }
</script>

<!-- Backdrop -->
<div class="modal-backdrop" on:click={onCancel} role="presentation">
  <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
    <div class="modal-hdr">
      <h2>Create your habit</h2>
      <button class="modal-close" on:click={onCancel}>✕</button>
    </div>

    <!-- Emoji picker toggle -->
    <div class="emoji-row">
      <button class="emoji-pick-btn" on:click={() => (showEmojiPicker = !showEmojiPicker)}>
        <span class="emoji-preview">{icon}</span>
        <span>Change icon</span>
      </button>
    </div>

    {#if showEmojiPicker}
      <div class="emoji-grid">
        {#each EMOJI_LIST as e}
          <button
            class="emoji-opt"
            class:active={icon === e}
            on:click={() => { icon = e; showEmojiPicker = false; }}
          >{e}</button>
        {/each}
      </div>
    {/if}

    <!-- Name -->
    <label class="field-label" for="habit-name">Habit name <span class="req">*</span></label>
    <input
      id="habit-name"
      class="field-input"
      type="text"
      placeholder="e.g. Meditate for 10 minutes"
      maxlength="60"
      bind:value={name}
    />

    <!-- Description -->
    <label class="field-label" for="habit-desc">Description</label>
    <textarea
      id="habit-desc"
      class="field-input field-ta"
      placeholder="What does this habit involve?"
      maxlength="200"
      rows="2"
      bind:value={desc}
    ></textarea>

    <!-- Tag -->
    <label class="field-label" for="habit-tag">Category</label>
    <select id="habit-tag" class="field-input" bind:value={tag}>
      {#each CUSTOM_TAGS as t}
        <option value={t}>{t}</option>
      {/each}
    </select>

    <!-- Verification -->
    <label class="toggle-row">
      <input type="checkbox" bind:checked={requireVerify} />
      <span>Require photo verification</span>
    </label>

    {#if requireVerify}
      <input
        class="field-input"
        type="text"
        placeholder="What should the photo show?"
        maxlength="80"
        bind:value={verifyLabel}
      />
    {/if}

    <div class="modal-footer">
      <button class="btn-cancel" on:click={onCancel}>Cancel</button>
      <button class="btn-add" disabled={!valid} on:click={handleAdd}>Add habit</button>
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
    padding: 0 0 env(safe-area-inset-bottom, 0);
  }

  .modal {
    width: 100%;
    max-width: 560px;
    background: var(--surface);
    border: 1px solid var(--b2);
    border-radius: var(--r) var(--r) 0 0;
    padding: 24px 20px 32px;
    animation: slideUp 0.22s ease;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .modal-hdr h2 {
    font-size: 17px;
    font-weight: 600;
  }

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

  .emoji-row {
    margin-bottom: 14px;
  }

  .emoji-pick-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--s2);
    border: 1px solid var(--b2);
    border-radius: var(--rsm);
    padding: 10px 14px;
    font-size: 13px;
    color: var(--t2);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
  }

  .emoji-preview {
    font-size: 22px;
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 4px;
    margin-bottom: 14px;
    background: var(--s2);
    border: 1px solid var(--b);
    border-radius: var(--rsm);
    padding: 10px;
    max-height: 160px;
    overflow-y: auto;
  }

  .emoji-opt {
    background: none;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    transition: all 0.15s;
    line-height: 1;
    font-family: 'DM Sans', sans-serif;
  }

  .emoji-opt:hover { background: var(--s3); }
  .emoji-opt.active { background: rgba(108, 92, 231, 0.2); border-color: var(--accent); }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 6px;
  }

  .req { color: var(--coral); }

  .field-input {
    display: block;
    width: 100%;
    background: var(--s2);
    border: 1px solid var(--b2);
    border-radius: var(--rsm);
    padding: 11px 14px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--t);
    outline: none;
    margin-bottom: 14px;
    transition: border-color 0.2s;
  }

  .field-input:focus { border-color: var(--accent); }

  .field-ta { resize: none; }

  select.field-input {
    appearance: none;
    cursor: pointer;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--t2);
    cursor: pointer;
    margin-bottom: 14px;
  }

  .toggle-row input { accent-color: var(--accent); width: 16px; height: 16px; }

  .modal-footer {
    display: flex;
    gap: 10px;
    margin-top: 6px;
  }

  .btn-cancel {
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

  .btn-add {
    flex: 2;
    padding: 13px;
    border-radius: var(--r);
    border: none;
    background: var(--accent);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-add:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-add:hover:not(:disabled) { background: #7c6ef7; }
</style>
