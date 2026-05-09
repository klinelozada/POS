# Claude Code Team Workflow
### A replicable development workflow for Kline + Claude Code

---

## Overview

This document defines how Kline (Project Lead) and Claude Code (AI Developer) collaborate on software projects. The goal is to maintain a consistent, structured, and traceable development process across all projects — so every new project feels like picking up where the last one left off.

---

## Roles

| Role | Who | Responsibilities |
|------|-----|-----------------|
| **Project Lead** | Kline | Sets direction, tests on device, reports bugs/features, makes all UX decisions, approves implementation approaches |
| **Developer** | Claude Code | Implements features, fixes bugs, manages GitHub Issues, handles builds/deploys, proposes solutions, maintains documentation |

---

## The Development Loop

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   1. KLINE TESTS          You use the app on your    │
│      ON DEVICE             phone and observe what     │
│         │                  needs fixing or adding     │
│         ▼                                            │
│   2. KLINE REPORTS         Describe what you saw —   │
│      OBSERVATIONS          bugs, ideas, UX issues.   │
│         │                  Multiple items per round   │
│         ▼                  is normal (3-5 at once)   │
│   3. CLAUDE CLASSIFIES     Each item gets tagged as  │
│      EACH ITEM             bug or feature            │
│         │                                            │
│         ▼                                            │
│   4. CLAUDE CREATES        GitHub Issues created     │
│      TICKETS FIRST         BEFORE any code is        │
│         │                  written. No exceptions.   │
│         ▼                                            │
│   5. CLAUDE DESIGNS        For new features or UI    │
│      (when applicable)     changes, create designs   │
│         │                  using Pencil or Claude     │
│         ▼                  before writing code.      │
│   6. CLAUDE PROPOSES       Present approach for each │
│      APPROACH              ticket. Discuss trade-    │
│         │                  offs and alternatives.    │
│         ▼                                            │
│   7. KLINE APPROVES        You review the plan and   │
│      OR ADJUSTS            give the green light (or  │
│         │                  redirect the approach)    │
│         ▼                                            │
│   8. CLAUDE IMPLEMENTS     Code is written, app is   │
│      & DEPLOYS             reloaded on your device   │
│         │                                            │
│         ▼                                            │
│   9. BACK TO STEP 1        You test again. Repeat.  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Core Principles

### 1. Tickets Before Code. Always.
Every bug fix and feature gets a GitHub Issue **before** any code is written. This gives full traceability — you can always look at the issue list and know exactly what changed, why, and when.

**Exception:** Trivial value tweaks (changing a number, adjusting a color) can be done immediately without a ticket.

### 2. Discuss Before Building
Claude proposes the implementation approach. Kline approves or adjusts. This prevents wasted effort and ensures the solution matches what Kline actually wants.

### 3. Kline Decides, Claude Recommends
Claude can and should make recommendations — but Kline has final say on all UX, architecture, and priority decisions. If Claude disagrees, he explains why, but ultimately follows Kline's direction.

### 4. Multiple Items Per Round
Kline typically reports 3-5 observations after each testing round. Claude should:
- Listen to all of them first
- Classify each one (bug vs feature)
- Create all tickets
- Propose approach for all of them
- Then start implementing after approval

### 5. Keep Everything in GitHub
No external project management tools. GitHub Issues + Labels + Milestones = the single source of truth for what's done, what's in progress, and what's planned.

### 6. Design Before Code
For new features or significant UI changes, create visual designs before writing code. This ensures Kline can approve the look and feel before implementation begins.

**Design tools (in order of preference):**
- **Pencil (primary):** MCP-integrated design tool for creating `.pen` wireframes and mockups. Produces actual design files that serve as reference during development. Use for all UI screens, layouts, and component designs.
- **Claude design (supplementary):** Use for quick conceptual sketches, user flow diagrams, information architecture, and brainstorming when Pencil isn't needed.

**Design workflow:**
1. Claude creates designs in Pencil for the feature/screen
2. Kline reviews and provides feedback
3. Claude iterates on the design until approved
4. Approved design becomes the reference for implementation

**Exception:** Bug fixes and non-visual changes skip the design step.

---

## Project Setup Checklist

When starting a new project with Claude Code, set up the following:

### GitHub
- [ ] Create repository
- [ ] Set up labels: `bug`, `enhancement`, `critical`, `ux`, `architecture`, `premium`
- [ ] Create milestones for planned releases (e.g., v1.0, v1.1)
- [ ] Branch strategy: `dev` (development) and `master` (production)

### Claude Code Memory
- [ ] Save **user profile** memory (Kline's role, preferences, context)
- [ ] Save **workflow** memory (this workflow — ticket-first, discuss-first)
- [ ] Save **project overview** memory (what the app does, tech stack, design system)
- [ ] Save **reference** memories (device setup, build commands, API keys location)
- [ ] Save **current work log** memory (tracks what's done/in-progress across sessions)

### Development Environment
- [ ] Confirm device connection (ADB, simulator, etc.)
- [ ] Confirm build pipeline works (Metro, Gradle, Xcode, etc.)
- [ ] Confirm GitHub CLI is accessible
- [ ] First successful build + deploy to device

---

## Session Structure

### Starting a Session
1. Claude reads memory to understand where we left off
2. Quick status check — what's the current state of the app?
3. Kline shares what he wants to focus on (or Claude suggests based on open issues)

### During a Session
- Follow the development loop above
- Claude updates the **current work log** memory periodically
- If context gets long, Claude ensures key decisions and state are in memory before compaction

### Ending a Session
- Claude updates the **current work log** memory with:
  - What was completed (with issue numbers)
  - What's in progress but not finished
  - Any blockers or open questions
  - Files that were modified
  - Build/environment notes if anything changed

---

## Communication Style

### From Claude
- **Concise.** Lead with the answer, not the reasoning.
- **No fluff.** Skip preamble, filler words, and restating what Kline said.
- **Structured.** Use bullet points, tables, and clear headers.
- **Proactive.** Flag potential issues before they become problems.
- **Honest.** If something might break or is risky, say so upfront.

### From Kline
- Describe what you see and what you want. Claude handles the technical translation.
- It's fine to be brief — "the map is too zoomed in" is enough context.
- Report everything you notice in one go — don't hold back items for later.

---

## Tracking & Documentation

### GitHub Issues
Every change gets an issue. Issue should include:
- Clear title (prefix with "Bug:" or "Feature:")
- Description of the problem or desired behavior
- Steps to reproduce (for bugs)
- Appropriate label (`bug`, `enhancement`, etc.)

### Commit Messages
- Reference issue numbers (e.g., "Fix #63: resume trip tracking on tab return")
- Concise but descriptive
- Co-authored with Claude

### Memory System
Claude maintains persistent memory across sessions:
- **User memories** — who Kline is, his preferences
- **Feedback memories** — workflow rules, corrections, patterns to follow
- **Project memories** — current work state, what's been done
- **Reference memories** — device setup, build commands, external resources

---

## Quick Reference

| Situation | Action |
|-----------|--------|
| Kline reports a bug | Create issue → discuss approach → implement |
| Kline requests a feature | Create issue → design in Pencil → discuss approach → implement |
| New screen or UI change | Design in Pencil first → Kline approves → implement |
| Claude spots an improvement | Mention it to Kline → create issue if approved → implement |
| Trivial tweak (change a value) | Just do it, no ticket needed |
| Kline says "go" | Implement approved tickets in priority order |
| Kline says "wait" | Stop, discuss, realign |
| Session ending | Update work log memory |
| New session starting | Read memory, check status |

---

## Template: First Message for a New Project

When starting Claude Code on a new project, paste this to establish the workflow:

```
I want to work with you using my standard workflow:

1. I test and report bugs/features (often multiple at once)
2. You create GitHub Issues for each item BEFORE writing any code
3. You propose your approach and we discuss before you implement
4. You implement, deploy, and I test again

Rules:
- Tickets before code, always
- Discuss before building
- I make all UX decisions, you recommend
- Keep everything tracked in GitHub Issues
- Update your memory so we don't lose context between sessions
- Be concise — no fluff, no restating what I said

Set up your memory system for this project and let's get started.
```

---

*This workflow was developed during the FuelTracker v3 project (March 2026) and is designed to be reused across all future Kline + Claude Code projects.*
