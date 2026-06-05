<script>
    export let posts = [];
    export let category = "";
    export let pageSize = 5;

    let currentPage = 0;

    $: totalPages = Math.ceil(posts.length / pageSize);
    $: visiblePosts = posts.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize,
    );
    $: emptySlots = totalPages > 1 ? pageSize - visiblePosts.length : 0;

    $: categorySlug = category.toLowerCase().replace(/\s+/g, '-');

    // Reimplemented for Svelte — Astro serializes publishDate as a string
    // which may be ISO format ("2026-05-23") or Date.toString() format.
    // Parse year/month/day manually to avoid the UTC offset bug.
    function formatDate(dateString) {
        let year, month, day;

        // Try ISO format first: "2026-05-23" or "2026-05-23T12:00"
        const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            year = Number(isoMatch[1]);
            month = Number(isoMatch[2]) - 1;
            day = Number(isoMatch[3]);
        } else {
            // Date.toString() format: "Thu Jun 04 2026 19:00:00 GMT-0500 ..."
            const d = new Date(dateString);
            year = d.getUTCFullYear();
            month = d.getUTCMonth();
            day = d.getUTCDate();
        }

        return new Date(year, month, day).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function prevPage() {
        if (currentPage > 0) currentPage--;
    }

    function nextPage() {
        if (currentPage < totalPages - 1) currentPage++;
    }
</script>

<div class="py-6">
    <a
        href={`/blog/category/${categorySlug}`}
        class="text-terminal-cyan hover:text-terminal-green no-underline"
    >
        <h4
            class="text-sm mb-4 border-b border-terminal-border pb-2"
        >
            {category}
        </h4>
    </a>
    <ul class="space-y-3">
        {#each visiblePosts as post}
            <li class="flex flex-col sm:flex-row sm:justify-between gap-1">
                <a
                    href={`/blog/${post.slug}`}
                    class="text-terminal-fg hover:text-terminal-green no-underline"
                >
                    {post.title}
                </a>
                <span class="text-terminal-dim text-sm shrink-0">
                    {formatDate(post.publishDate)}{post.author ? ` · ${post.author}` : ''}
                </span>
            </li>
        {/each}
        {#each Array(emptySlots) as _}
            <li
                class="flex flex-col sm:flex-row sm:justify-between gap-1 invisible"
                aria-hidden="true"
            >
                <span>&nbsp;</span>
            </li>
        {/each}
    </ul>

    {#if totalPages > 1}
        <nav class="flex items-center gap-3 mt-4 text-sm">
            <button
                on:click={prevPage}
                disabled={currentPage === 0}
                class="text-terminal-cyan hover:text-terminal-green disabled:text-terminal-dim disabled:cursor-default cursor-pointer bg-transparent border-none font-mono text-sm p-0"
            >
                &lt; prev
            </button>
            <span class="text-terminal-dim">
                {currentPage + 1} / {totalPages}
            </span>
            <button
                on:click={nextPage}
                disabled={currentPage === totalPages - 1}
                class="text-terminal-cyan hover:text-terminal-green disabled:text-terminal-dim disabled:cursor-default cursor-pointer bg-transparent border-none font-mono text-sm p-0"
            >
                next &gt;
            </button>
        </nav>
    {/if}
</div>
