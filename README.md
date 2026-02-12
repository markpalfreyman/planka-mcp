# PLANKA MCP Server (Fork)

A Model Context Protocol (MCP) server for [PLANKA](https://planka.app) kanban boards, purpose-built for Claude and other AI agents.

Forked from [gogogadgetbytes/planka-mcp](https://github.com/gogogadgetbytes/planka-mcp) with bug fixes and security patches.

## Changes from upstream

- **Fix: Board reads crash on unknown label colours** — Response parsing now accepts any colour string instead of crashing on colours not in the hardcoded enum (e.g. "summer-sky")
- **Fix: Remove label from card 404** — Try direct `/api/card-labels/{id}` endpoint with fallback to nested endpoint
- **Fix: Create list fails with "1 missing or invalid parameter"** — Don't send position unless explicitly provided
- **Security: MCP SDK updated** — Patched cross-client data leak vulnerability (GHSA-345p-7cg4-v4c7)

## Features

- Full PLANKA 2.0 API support
- Type-safe with Zod validation
- Optimised for agent workflows (combined operations, sensible defaults)
- 13 tools covering cards, tasks, labels, comments, and lists

## Installation

Run directly from this repo:

```bash
npx github:markpalfreyman/planka-mcp
```

Or clone and build:

```bash
git clone https://github.com/markpalfreyman/planka-mcp.git
cd planka-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PLANKA_BASE_URL` | Yes | Your PLANKA server URL |
| `PLANKA_AGENT_EMAIL` | Yes | Agent user email |
| `PLANKA_AGENT_PASSWORD` | Yes | Agent user password |

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "planka": {
      "command": "npx",
      "args": ["github:markpalfreyman/planka-mcp"],
      "env": {
        "PLANKA_BASE_URL": "https://planka.example.com",
        "PLANKA_AGENT_EMAIL": "agent@example.com",
        "PLANKA_AGENT_PASSWORD": "your-password"
      }
    }
  }
}
```

### Claude Code

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "planka": {
      "command": "npx",
      "args": ["github:markpalfreyman/planka-mcp"],
      "env": {
        "PLANKA_BASE_URL": "https://planka.example.com",
        "PLANKA_AGENT_EMAIL": "agent@example.com",
        "PLANKA_AGENT_PASSWORD": "your-password"
      }
    }
  }
}
```

### MetaMCP

In MetaMCP server config, set:
- **Type:** STDIO
- **Command:** `npx`
- **Args:** `github:markpalfreyman/planka-mcp`
- **Env vars:** `PLANKA_BASE_URL`, `PLANKA_AGENT_EMAIL`, `PLANKA_AGENT_PASSWORD`

## Available Tools

### Navigation

| Tool | Description |
|------|-------------|
| `planka_get_structure` | Get projects, boards, and lists hierarchy |
| `planka_get_board` | Get a board with all cards, lists, and labels |

### Cards

| Tool | Description |
|------|-------------|
| `planka_create_card` | Create a card (optionally with tasks) |
| `planka_update_card` | Update card properties |
| `planka_move_card` | Move card to different list/position |
| `planka_get_card` | Get card details with tasks/comments |
| `planka_delete_card` | Delete a card |

### Tasks

| Tool | Description |
|------|-------------|
| `planka_create_tasks` | Add tasks (checklist items) to a card |
| `planka_update_task` | Update task name or completion |
| `planka_delete_task` | Delete a task |

### Labels

| Tool | Description |
|------|-------------|
| `planka_manage_labels` | Create/update/delete board labels |
| `planka_set_card_labels` | Add/remove labels from a card |

### Comments

| Tool | Description |
|------|-------------|
| `planka_add_comment` | Add a comment to a card |
| `planka_get_comments` | Get all comments on a card |

### Lists

| Tool | Description |
|------|-------------|
| `planka_manage_lists` | Create/update/delete lists |

## PLANKA 2.0 Compatibility

This server is designed for PLANKA 2.0 and handles the API differences from 1.x:

- Card creation includes required `type` field
- Label endpoints use `/card-labels` path
- Optional fields handled gracefully

## Development

```bash
git clone https://github.com/markpalfreyman/planka-mcp.git
cd planka-mcp
npm install
npm run build
npm test
```

## License

MIT
