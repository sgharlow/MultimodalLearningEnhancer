# Testing Guide - Day 2 Content Extraction

## What's Working Now

After Day 2, you have a functioning content extraction system that can:

- ✅ Extract main article content from web pages
- ✅ Handle text selections
- ✅ Clean and normalize content
- ✅ Analyze content type (tutorial, historical, conceptual, technical)
- ✅ Recommend diagram types (flowchart, mindmap, timeline)
- ✅ Extract metadata (title, author, date, keywords)
- ✅ Detect sequential steps, temporal elements, hierarchies
- ✅ Context menu integration
- ✅ Message passing between components

## How to Test

### **Step 1: Load the Extension**

1. Open **Chrome Dev** or **Chrome Canary**
2. Go to `chrome://extensions`
3. Enable **"Developer mode"** (top right)
4. Click **"Load unpacked"**
5. Select: `C:\Users\sghar\CascadeProjects\LearnMyWay`
6. Extension should load successfully

### **Step 2: Open DevTools Console**

To see what's happening:

1. Visit any webpage
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for `[MLE]` messages

You should see:
```
[MLE] Content script loaded
[MLE] Initializing Multimodal Learning Enhancer...
[MLE] Chrome AI availability: {...}
[MLE] Initialization complete
```

### **Step 3: Test Context Menu**

1. **Right-click** anywhere on a webpage
2. You should see: **"Transform with Learning Enhancer"** with 3 sub-options:
   - 📊 Generate Diagram
   - 📝 Create Summary (Bullet Points)
   - 🎯 Create Study Notes

3. **Select any text** on the page
4. **Right-click** on the selection
5. Same menu should appear

### **Step 4: Test Content Extraction**

Try clicking a context menu item. In the console, you'll see:

```
[MLE] Received message: TRANSFORM_CONTENT
[MLE] Starting transformation: {type: "visual", source: "auto"}
[MLE] Content extracted: {title: "...", length: 1234, words: 234}
Recommended diagram type: flowchart
[MLE] Visual transformation requested
```

The transformation won't complete yet (placeholder), but extraction should work!

### **Step 5: Test Popup**

1. Click the **extension icon** in toolbar
2. Popup should open showing:
   - API status (will show unavailable unless you have Chrome AI enabled)
   - Quick action buttons (disabled for now)
   - Empty history

## Test Sites

Try the extraction on these different types of content:

### **1. Technical Tutorial (Should recommend: Flowchart)**

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
- https://react.dev/learn/thinking-in-react
- https://docs.python.org/3/tutorial/

**Expected:**
- Detects sequential steps
- Recommends flowchart
- Extracts technical terms

### **2. Historical Article (Should recommend: Timeline)**

- https://en.wikipedia.org/wiki/World_War_II
- https://en.wikipedia.org/wiki/French_Revolution
- https://en.wikipedia.org/wiki/Renaissance

**Expected:**
- Detects temporal elements (years, dates)
- Recommends timeline
- Extracts temporal markers

### **3. Conceptual Content (Should recommend: Mind Map)**

- https://en.wikipedia.org/wiki/Philosophy
- https://en.wikipedia.org/wiki/Artificial_intelligence
- https://plato.stanford.edu/entries/consciousness/

**Expected:**
- Detects hierarchical concepts
- Recommends mindmap
- Extracts key concepts

## Manual Testing via Console

You can manually test extraction in DevTools console:

```javascript
// Get the content extractor instance
const extractor = new ContentExtractor();

// Extract current page content
const extraction = extractor.extract({ source: 'auto' });
console.log('Extracted content:', extraction);

// Analyze the content
const analyzer = new ContentAnalyzer();
const analysis = analyzer.analyze(extraction);
console.log('Content analysis:', analysis);

// Check recommended diagram
console.log('Recommended diagram:', analysis.recommendedDiagram);
console.log('Confidence:', analysis.diagramConfidence);
```

## Expected Console Output

For a technical tutorial like MDN Functions:

```javascript
{
  extraction: {
    title: "Functions - JavaScript | MDN",
    content: "Functions are one of the fundamental building blocks...",
    url: "https://developer.mozilla.org/...",
    metadata: {
      wordCount: 2341,
      readingTime: 12,
      contentLength: 15432
    }
  },
  analysis: {
    contentType: "tutorial",
    recommendedDiagram: "flowchart",
    diagramConfidence: 0.7,
    hasSequentialSteps: true,
    hasTechnicalContent: true,
    mainTopics: ["Functions", "JavaScript", "Parameters"],
    keyTerms: ["function", "parameter", "return", "scope"]
  }
}
```

## Troubleshooting

### Extension Won't Load
- **Check manifest.json** for syntax errors
- **Check console** for error messages
- **Reload extension** after changes

### Context Menu Not Showing
- **Refresh the page** after loading extension
- **Check service worker** is running at chrome://extensions
- **Check console** for initialization errors

### Content Extraction Fails
- **Check page structure** - some sites have unusual layouts
- **Try text selection** instead of auto-detection
- **Check console** for specific error messages

### No Console Messages
- **Refresh the page** after loading extension
- **Check content script** loaded at chrome://extensions → Extension details → Inspect views
- **Check for JavaScript errors** in console

## What Doesn't Work Yet

- ❌ **Actual transformations** - Placeholders for Day 3-4
- ❌ **Results display** - Widget coming in Day 5
- ❌ **Chrome AI API calls** - Integration complete but transformations use placeholders
- ❌ **History viewer** - Works but no real transformations to save yet

## Success Criteria for Day 2

You should be able to:

1. ✅ Load extension without errors
2. ✅ See context menu on all pages
3. ✅ See `[MLE] Initialization complete` in console
4. ✅ Click context menu and see extraction logs
5. ✅ See different diagram recommendations for different content types
6. ✅ Extract clean content from various websites
7. ✅ See metadata extracted (title, author, etc.)

## Next Steps (Day 3)

Tomorrow we'll implement:

- Text summarization using Summarizer API
- Study notes generation using Writer API
- Bullet points extraction
- Real transformations instead of placeholders

## Tips

- **Keep DevTools open** while testing to see what's happening
- **Test on different sites** to see how extraction adapts
- **Try both auto-detection and text selection** modes
- **Check the console** for detailed extraction and analysis results

---

**Day 2 Complete! Content extraction is working! 🎉**

Ready for Day 3: Text Transformations
