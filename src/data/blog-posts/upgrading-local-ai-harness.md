---
title: 'Upgrading the Local AI Harness: Self-Contained MCP and Blog Publishing'
slug: upgrading-local-ai-harness
publishDate: '2026-09-02'
description: 'Migrating the blog publishing pipeline to a self-contained opencode environment with fixed MCP server and verified image generation.'
categories: ['Software Development']
tags: ['mcp', 'opencode', 'blog-publishing', 'fal-ai', 'python']
author: Andrew
comments_enabled: true
featured: true
image: '/assets/blog/upgrading-local-ai-harness.webp'
---

# Upgrading the Local AI Harness: Self-Contained MCP and Blog Publishing

## The Problem

The blog publishing workflow relied on paths and dependencies scattered across `~/.enchanter/` — a legacy environment from a different agent framework. When the opencode harness was set up fresh, none of the MCP servers, Python venvs, or environment files were configured. The `blog-post-publish` skill documented the correct environment but pointed to the old locations.

## The Fix

### 1. Created a Self-Contained opencode Environment

Everything now lives under `~/.config/opencode/`:

```
~/.config/opencode/
├── opencode.json           # MCP registration
├── .env                    # FAL_KEY for image generation
├── venv/                   # Python venv with fal-client, mcp, pillow, python-dotenv
├── mcp/
│   └── fal-blog-images/    # MCP server for blog image generation
└── scripts/
    ├── generate-blog-image.py   # Primary image generation script
    ├── process-theology-series.md
    ├── pre-commit-hook-behavior.md
    └── env-verification.md
```

### 2. Fixed the MCP Server for the New SDK

The MCP Python SDK v2.x changed from decorator-based to callback-based registration:

```python
# Old (broken)
@app.list_tools()
async def list_tools() -> list[Tool]: ...

@app.call_tool()
async def call_tool(name, args) -> list[TextContent]: ...

# New (working)
app = Server(
    "fal-blog-images",
    on_list_tools=list_tools,
    on_call_tool=call_tool,
)

async def list_tools(ctx, params) -> types.ListToolsResult:
    return types.ListToolsResult(tools=TOOLS)

async def call_tool(ctx, params) -> types.CallToolResult:
    # dispatch to handlers, wrap in CallToolResult
    ...
```

The server now exposes three tools:

- `generate_blog_image` — dry-run or generate from a post's frontmatter
- `list_blog_posts` — inventory of posts and their image status
- `regenerate_all_images` — batch regenerate missing images

### 3. Updated the Blog Publishing Skill

All paths in `blog-post-publish/SKILL.md` now point to `~/.config/opencode/`:

- Image generation script
- Python venv activation
- FAL_KEY location
- Environment verification probes

The MCP server is registered in `opencode.json` as a local stdio server and shows as `✓ connected`.

## Verification

All environment probes pass:

```bash
$ ls ~/.config/opencode/scripts/generate-blog-image.py
/home/andrew/.config/opencode/scripts/generate-blog-image.py

$ ~/.config/opencode/venv/bin/python -c "import fal_client; print('fal_client OK')"
fal_client OK

$ grep -q '^FAL_KEY=' ~/.config/opencode/.env && echo "FAL_KEY present"
FAL_KEY present

$ opencode mcp list
●  ✓ fal-blog-images  connected
```

The original Python script remains the primary image generation path (more reliable than the MCP fallback), and the skill's pre-commit hook workaround (`git commit --no-verify`) is documented for the repo-wide prettier drift.

## Why This Matters

- **No external dependencies**: The harness doesn't reach into `~/.enchanter/` or assume Hermes/Enchanter exists
- **Reproducible**: Fresh machine? Copy `~/.config/opencode/`, run `python -m venv venv && pip install -r requirements.txt`, done
- **Auditable**: Every tool, key, and path is visible in the config directory
- **Skill-aligned**: The `blog-post-publish` skill now matches reality — no more "source docs lie about the environment"

## Conclusion

The publishing pipeline is now robust, self-contained, and verified. Next time the harness is rebuilt, the skill documentation _is_ the runbook — no archaeological dig through old configs required.
