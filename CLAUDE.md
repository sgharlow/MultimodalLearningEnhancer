# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Multimodal Learning Enhancer (LearnMyWay)

A Chrome extension that transforms any webpage content into personalized learning formats -- diagrams, summaries, and study notes -- powered by Chrome's built-in AI (Gemini Nano). Built for the Google Chrome Built-in AI Challenge 2025 ("Most Helpful" category).

**Remote name:** MultimodalLearningEnhancer
**Status:** Complete and submission-ready

## Tech Stack

- Chrome Extension (Manifest V3)
- Chrome Built-in AI APIs: Prompt API, Summarizer API, Writer API, Rewriter API
- Mermaid.js for diagram rendering
- Vanilla JavaScript (~6,850 lines)

## Project Structure

```
LearnMyWay/
├── manifest.json          # Extension config (Manifest v3)
├── background/            # Service worker for context menu and routing
├── content/               # Content scripts (extraction, widget)
├── lib/                   # Chrome AI wrappers, diagram/text generators
├── templates/             # Prompt templates for AI
├── popup/                 # Extension popup UI
├── styles/                # CSS files
└── docs/                  # Setup and troubleshooting guides
```

## Key Features

- 3 diagram types (flowchart, mind map, timeline) via Mermaid
- Bullet summaries, study notes, Cornell notes
- Smart content type auto-detection
- Interactive diagrams (zoom, pan, SVG export)
- History management with search/filter/export
- 100% local processing (privacy-first)

## Development

```bash
# Load as unpacked extension in Chrome Dev/Canary
# 1. chrome://extensions -> Developer mode -> Load unpacked
# 2. Select this directory
```

Requires Chrome Dev (v128+) or Chrome Canary with AI flags enabled. See `docs/API_ENABLE_INSTRUCTIONS.md`.

## Testing

No automated test suite. Manual test plan in `TESTING_PLAN.md`.
All testing is manual via the extension UI (context menu, popup, widget).
