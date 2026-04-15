# Claude Project Configuration

This directory contains project-scoped Claude Code configuration for this repository.

## Structure
- settings.json: shared permissions and hooks
- settings.local.json.example: template for machine-local overrides
- rules/: stable coding rules loaded on demand
- commands/: repeatable workflows available as slash commands
- skills/: reusable multi-step workflows with optional supporting files
- agents/: specialized subagents
- hooks/: scripts executed from settings hooks

## Operating habits
1. Keep CLAUDE.md short and stable.
2. Use plan mode for multi-file changes and refactors.
3. Move repeated prompts to skills or commands.
4. Use hooks for deterministic guardrails.

## Team-shared vs local
- Commit: CLAUDE.md, .mcp.json, .claude/settings.json, rules, commands, skills, agents, hooks.
- Do not commit: CLAUDE.local.md, .claude/settings.local.json.
