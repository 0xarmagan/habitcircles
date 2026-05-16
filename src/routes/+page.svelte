<script lang="ts">
  import { appState } from '$lib/stores/state';
  import Onboarding from '$lib/components/Onboarding.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import CheckinPage from '$lib/components/CheckinPage.svelte';

  // Reactive: which top-level view to show
  type View = 'onboarding' | 'dashboard' | 'checkin';
  let view: View = $appState.started ? 'dashboard' : 'onboarding';

  function goTo(v: View) {
    view = v;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

{#if view === 'onboarding'}
  <Onboarding onStart={() => goTo('dashboard')} />
{:else if view === 'dashboard'}
  <Dashboard
    onBack={() => goTo('onboarding')}
    onCheckin={() => goTo('checkin')}
  />
{:else if view === 'checkin'}
  <CheckinPage onBack={() => goTo('dashboard')} />
{/if}
