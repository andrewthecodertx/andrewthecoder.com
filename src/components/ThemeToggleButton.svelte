<script>
    const rootEl =
        typeof document !== "undefined" ? document.documentElement : null;
    let isDark = false;

    if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) {
            isDark = storedTheme === "dark";
        }
    } else if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        isDark = true;
    }

    function handleToggle() {
        isDark = !isDark;
        const theme = isDark ? "dark" : "light";
        if (typeof localStorage !== "undefined" && typeof localStorage.setItem === "function") {
            localStorage.setItem("theme", theme);
        }
    }

    $: if (rootEl && !isDark) {
        rootEl.classList.remove("dark");
    } else if (rootEl && isDark) {
        rootEl.classList.add("dark");
    }
</script>

<button
    type="button"
    role="switch"
    aria-checked={isDark}
    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    class="toggle"
    class:active={isDark}
    on:click={handleToggle}
>
    <span class="toggle-track">
        <span class="toggle-thumb"></span>
    </span>
</button>

<style>
    .toggle {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding: 4px;
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .toggle-track {
        position: relative;
        width: 44px;
        height: 24px;
        background-color: #d1d5db;
        border-radius: 9999px;
        transition: background-color 0.2s ease;
    }

    .toggle.active .toggle-track {
        background-color: #6366f1;
    }

    .toggle-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 9999px;
        transition: transform 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .toggle.active .toggle-thumb {
        transform: translateX(20px);
    }

    .toggle:focus-visible .toggle-track {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
    }

    :global(.dark) .toggle-track {
        background-color: #4b5563;
    }

    :global(.dark) .toggle.active .toggle-track {
        background-color: #818cf8;
    }
</style>
