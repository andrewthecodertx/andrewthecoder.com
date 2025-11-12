<script>
    const rootEl =
        typeof document !== "undefined" ? document.documentElement : null;
    const themes = ["light", "dark"];
    let theme = "";

    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
        theme = localStorage.getItem("theme");
    } else if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        theme = "dark";
    }

    function handleChange(event) {
        theme = event.target.value;
        localStorage.setItem("theme", theme);
    }

    $: if (rootEl && theme === "light") {
        rootEl.classList.remove("dark");
    } else if (rootEl && theme === "dark") {
        rootEl.classList.add("dark");
    }

    const icons = [
        `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clip-rule="evenodd"
      />
    </svg>`,
        `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>`,
    ];
</script>

<div class="inline-flex items-center px-1.5 py-2.5 gap-2">
    {#each themes as t, i}
        <label class={theme === t ? "checked" : ""}>
            {@html icons[i]}
            <input
                type="radio"
                name="theme-toggle"
                checked={theme === t}
                value={t}
                title={`Use ${t} theme`}
                aria-label={`Use ${t} theme`}
                on:change={handleChange}
            />
        </label>
    {/each}
</div>

<style>
    .theme-toggle > label:focus-within {
        outline: 2px solid transparent;
        box-shadow:
            0 0 0 0.08em var(--primary-color),
            0 0 0 0.12em var(--background-body);
    }

    .theme-toggle > label {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        cursor: pointer;
        transition:
            opacity 0.2s ease-in-out,
            color 0.2s ease-in-out;
    }

    .theme-toggle > label:hover {
        opacity: 1;
        color: var(--text-main); /* Main text color on hover */
    }

    .theme-toggle .checked {
        color: var(--primary-color);
        opacity: 1;
    }

    input[name="theme-toggle"] {
        position: absolute;
        opacity: 0;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: -1;
    }

    @media screen and (max-width: 520px) {
        .theme-toggle {
            margin-top: 0.3em;
        }

        :global(svg) {
            width: 8px;
            height: 8px;
        }
    }
</style>
