# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐    ┌─────────────┐ │
│  │   Popup UI   │      │Content Script│    │Service Worker│ │
│  │              │      │              │    │             │ │
│  │ - History    │      │ - Widget     │    │ - Context   │ │
│  │ - Settings   │      │ - Extractor  │    │   Menu      │ │
│  │ - Status     │      │ - Injector   │    │ - Messages  │ │
│  └──────┬───────┘      └──────┬───────┘    └──────┬──────┘ │
│         │                     │                    │        │
│         └─────────────────────┼────────────────────┘        │
│                               │                             │
│  ┌────────────────────────────┼─────────────────────────┐  │
│  │          Core Processing Layer                        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │Content      │  │Text          │  │Visual       │  │  │
│  │  │Extractor    │  │Transformer   │  │Generator    │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  │  │
│  │         │                │                 │          │  │
│  │         └────────────────┼─────────────────┘          │  │
│  │                          │                            │  │
│  │  ┌───────────────────────┼────────────────────────┐  │  │
│  │  │      Chrome AI APIs Integration Layer          │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │                                                 │  │  │
│  │  │  • ai.languageModel (Prompt API)               │  │  │
│  │  │  • ai.summarizer (Summarizer API)              │  │  │
│  │  │  • ai.writer (Writer API)                      │  │  │
│  │  │  • ai.rewriter (Rewriter API)                  │  │  │
│  │  │                                                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Storage Layer (IndexedDB)                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Transformation History                            │   │
│  │  • User Preferences                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. **Content Script Layer**
- **Purpose**: Runs on every webpage, extracts content, displays widget
- **Files**:
  - `content/content-script.js` - Main injection point
  - `content/content-extractor.js` - Content extraction logic
  - `content/widget.js` - Floating UI widget
- **Responsibilities**:
  - Detect page content structure
  - Extract main article/selected text
  - Inject and manage floating widget
  - Communicate with service worker

### 2. **Service Worker (Background)**
- **Purpose**: Handles extension lifecycle, context menu, message routing
- **Files**:
  - `background/service-worker.js`
- **Responsibilities**:
  - Manage context menu
  - Route messages between components
  - Handle extension installation
  - Manage API availability checks

### 3. **Popup UI**
- **Purpose**: Extension popup interface (click extension icon)
- **Files**:
  - `popup/popup.html`
  - `popup/popup.js`
  - `popup/popup.css`
  - `popup/history.html`
  - `popup/history.js`
- **Responsibilities**:
  - Show transformation history
  - Display API status
  - Provide settings interface

### 4. **Content Extractor**
- **Purpose**: Extract clean content from web pages
- **Algorithm**:
  ```javascript
  function extractContent(mode) {
    if (mode === 'selection') {
      return getSelection().toString();
    }

    // Smart article detection
    const candidates = [
      document.querySelector('article'),
      document.querySelector('main'),
      document.querySelector('[role="main"]'),
      heuristicExtraction() // Find element with most <p> tags
    ];

    const article = candidates.find(el => el && el.textContent.length > 200);
    return cleanContent(article);
  }
  ```

### 5. **Chrome AI APIs Wrapper**
- **Purpose**: Unified interface for all Chrome AI APIs
- **Files**:
  - `lib/chrome-ai-apis.js`
- **API Methods**:
  ```javascript
  class ChromeAI {
    async checkAvailability() { }
    async createSummarizer(options) { }
    async createWriter(options) { }
    async createRewriter(options) { }
    async createLanguageModel(options) { }
  }
  ```

### 6. **Text Transformer**
- **Purpose**: Generate text summaries and study notes
- **Files**:
  - `lib/text-transformer.js`
  - `lib/prompt-templates.js`
- **Methods**:
  - `generateBulletPoints(content)` - Uses Summarizer API
  - `generateStudyNotes(content)` - Uses Writer API + custom prompts
- **Output Format**:
  ```javascript
  {
    type: 'bullet-points' | 'study-notes',
    content: string,
    metadata: {
      originalLength: number,
      summaryLength: number,
      readingTime: number
    }
  }
  ```

### 7. **Visual Generator**
- **Purpose**: Generate interactive diagrams using Mermaid.js
- **Files**:
  - `lib/visual-engine.js`
  - `lib/diagram-generator.js`
  - `lib/interactive-diagram.js`
  - `templates/diagram-prompts.js`
- **Flow**:
  ```
  Content → Analyze Type → Generate Prompt → LLM (Prompt API)
    → Mermaid Code → Validate → Render → Add Interactivity
  ```
- **Diagram Type Detection**:
  ```javascript
  function detectDiagramType(content) {
    const features = analyzeContent(content);

    if (features.hasSequentialSteps || features.hasAlgorithm) {
      return 'flowchart';
    }
    if (features.hasTemporalMarkers || features.hasDates) {
      return 'timeline';
    }
    if (features.hasHierarchy || features.hasConcepts) {
      return 'mindmap';
    }

    return 'flowchart'; // default
  }
  ```

### 8. **Interactive Diagram Features**
- **Zoom**: Ctrl + Scroll wheel
- **Pan**: Click and drag
- **Node Click**: Show details/expand
- **Download**: Export as SVG
- **Implementation**:
  ```javascript
  class InteractiveDiagram {
    constructor(svgElement) {
      this.svg = svgElement;
      this.scale = 1;
      this.position = { x: 0, y: 0 };

      this.attachZoomHandler();
      this.attachPanHandler();
      this.attachNodeClickHandlers();
      this.addDownloadButton();
    }
  }
  ```

### 9. **Storage Manager**
- **Purpose**: Persist transformations and preferences
- **Files**:
  - `lib/storage.js`
- **Schema**:
  ```javascript
  // Transformations Store
  {
    storeName: 'transformations',
    keyPath: 'id',
    indexes: ['url', 'created', 'type']
  }

  // Transformation Object
  {
    id: string,           // timestamp-based
    url: string,          // source URL
    title: string,        // page title
    type: 'visual' | 'summary' | 'studynotes',
    output: object,       // transformation result
    created: timestamp,
    sourceType: 'auto' | 'selection'
  }
  ```

## Data Flow

### User Initiates Transformation

```
User clicks button or right-click menu
    ↓
Content Script extracts content
    ↓
Content Analyzer determines content type
    ↓
Route to appropriate transformer:
    ├→ Visual Generator (for diagram)
    ├→ Text Transformer (for bullet points)
    └→ Text Transformer (for study notes)
    ↓
Chrome AI APIs process content
    ↓
Format and render output
    ↓
Save to IndexedDB
    ↓
Display in widget/results area
```

### Chrome AI API Flow

```
Check API Availability
    ↓
If available:
    ├→ Create session (Summarizer/Writer/LanguageModel)
    ├→ Send content + prompt
    ├→ Stream/receive response
    └→ Return formatted result

If unavailable:
    └→ Show fallback message with enable instructions
```

## File Structure

```
LearnMyWay/
├── manifest.json                 # Extension manifest (v3)
│
├── background/
│   └── service-worker.js         # Background script, context menu
│
├── content/
│   ├── content-script.js         # Main content script entry
│   ├── content-extractor.js      # Content extraction logic
│   └── widget.js                 # Floating widget UI
│
├── popup/
│   ├── popup.html                # Extension popup HTML
│   ├── popup.js                  # Popup logic
│   ├── popup.css                 # Popup styles
│   ├── history.html              # History view
│   └── history.js                # History logic
│
├── lib/
│   ├── chrome-ai-apis.js         # Chrome AI APIs wrapper
│   ├── content-analyzer.js       # Content type analyzer
│   ├── text-transformer.js       # Text summaries generator
│   ├── visual-engine.js          # Mermaid rendering engine
│   ├── diagram-generator.js      # Diagram generation logic
│   ├── interactive-diagram.js    # Zoom, pan, click features
│   ├── storage.js                # IndexedDB wrapper
│   ├── mermaid.min.js            # Mermaid.js library
│   └── utils.js                  # Shared utilities
│
├── templates/
│   ├── diagram-prompts.js        # Prompt templates for diagrams
│   └── text-prompts.js           # Prompt templates for summaries
│
├── styles/
│   ├── widget.css                # Widget styles
│   ├── diagram.css               # Diagram display styles
│   └── common.css                # Shared styles
│
├── assets/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── images/
│       └── coming-soon-badge.svg
│
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── ARCHITECTURE.md
│   └── API_ENABLE_INSTRUCTIONS.md
│
└── README.md
```

## Key Technical Decisions

### 1. **Chrome Extension Manifest V3**
- Uses service workers instead of background pages
- Declarative permissions for better security
- Content scripts for webpage interaction

### 2. **Communication Pattern**
- Content Script ↔ Service Worker: `chrome.runtime.sendMessage()`
- Message types: `EXTRACT_CONTENT`, `TRANSFORM`, `SAVE_HISTORY`

### 3. **Chrome AI APIs**
- Prompt API: Diagram generation (structured output)
- Summarizer API: Quick bullet point extraction
- Writer API: Study notes generation (creative writing)
- Rewriter API: Content reformatting if needed

### 4. **Mermaid.js for Diagrams**
- Client-side rendering (no server needed)
- Supports flowcharts, mindmaps, timelines
- SVG output (scalable, downloadable)

### 5. **IndexedDB for Storage**
- Async, large storage capacity
- Structured data with indexes
- Offline-capable

### 6. **Error Handling Strategy**
- API unavailable: Show enable instructions
- Content extraction fails: Fallback to selection mode
- Diagram generation fails: Retry with simpler prompt
- Mermaid syntax error: Auto-fix common issues

## Performance Targets

- **Content Extraction**: <100ms
- **Text Summary**: <3 seconds
- **Diagram Generation**: <5 seconds
- **Total Transformation**: <5 seconds
- **Storage Operations**: <50ms
- **Widget Injection**: <200ms

## Security & Privacy

- **No server calls**: 100% client-side processing
- **No data collection**: Nothing leaves the browser
- **Content script isolation**: Runs in isolated world
- **Minimal permissions**: Only what's needed
- **Open source**: Transparent code

---

This architecture ensures:
✅ Fast, responsive user experience
✅ Privacy-first design
✅ Scalable for future features
✅ Clean separation of concerns
✅ Easy to test and debug
