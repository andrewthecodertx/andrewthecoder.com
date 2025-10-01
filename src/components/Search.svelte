<script>
  import { onMount } from 'svelte';

  let searchTerm = '';
  let posts = [];
  let filteredPosts = [];

  onMount(async () => {
    const response = await fetch('/search.json');
    posts = await response.json();
    filteredPosts = posts;
  });

  $: {
    if (searchTerm) {
      filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.categories.some(category => category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      filteredPosts = posts;
    }
  }
</script>

<div class="search-container">
  <input type="text" bind:value={searchTerm} placeholder="Search posts..." />

  {#if filteredPosts.length > 0}
    <ul class="search-results">
      {#each filteredPosts as post}
        <li>
          <a href="/blog/{post.slug}">{post.title}</a>
          <p>{post.description}</p>
        </li>
      {/each}
    </ul>
  {:else if searchTerm}
    <p>No results found for "{searchTerm}".</p>
  {:else}
    <p>Start typing to search posts.</p>
  {/if}
</div>

<style>
  .search-container {
    margin-top: 20px;
  }

  input[type="text"] {
    width: 100%;
    padding: 10px;
    font-size: 1.1em;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    background-color: var(--background);
    color: var(--text-primary);
  }

  .search-results {
    list-style: none;
    padding: 0;
    margin-top: 20px;
  }

  .search-results li {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border-color);
  }

  .search-results li:last-child {
    border-bottom: none;
  }

  .search-results a {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--accent);
    text-decoration: none;
  }

  .search-results a:hover {
    text-decoration: underline;
  }

  .search-results p {
    color: var(--text-secondary);
    margin-top: 5px;
  }
</style>