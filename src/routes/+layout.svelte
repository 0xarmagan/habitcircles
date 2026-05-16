<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import Toast from '$lib/components/Toast.svelte';
</script>

<Nav />
<Toast />
<slot />
