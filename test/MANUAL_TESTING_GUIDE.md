# 📋 Manual Testing Guide

**Estimated Time:** 60-90 minutes
**Prerequisites:** Chrome Dev/Canary with APIs enabled, extension loaded

---

## Quick Start

1. **Run automated tests first** (5 min)
2. **Test core transformations** (30 min)
3. **Test Path A features** (20 min)
4. **Test edge cases** (15 min)
5. **Capture screenshots** (10 min)

---

## Setup Checklist

Before starting tests, verify:

- [ ] Chrome Dev/Canary (v128+) installed
- [ ] All flags enabled at `chrome://flags`:
  - [ ] `#prompt-api-for-gemini-nano`
  - [ ] `#summarization-api-for-gemini-nano`
  - [ ] `#writer-api-for-gemini-nano`
  - [ ] `#rewriter-api-for-gemini-nano`
  - [ ] `#optimization-guide-on-device-model` → "Enabled BypassPerfRequirement"
- [ ] Chrome restarted after enabling flags
- [ ] Gemini Nano model downloaded
- [ ] Extension loaded at `chrome://extensions`
- [ ] DevTools Console open (F12) for monitoring

**Verify API Status:**
1. Click extension icon (🧠)
2. All 4 indicators should be GREEN
3. If RED, see docs/API_ENABLE_INSTRUCTIONS.md

---

## Part 1: Automated Tests (5 min)

### Step 1: Run Automated Test Suite

1. Navigate to: **https://en.wikipedia.org/wiki/Artificial_intelligence**
2. Open DevTools Console (F12)
3. Copy-paste entire contents of `test/automated-tests.js` into console
4. Press Enter
5. Run: `await runAllTests()`
6. Wait ~10 seconds for completion

**Expected Results:**
```
✅ Passed: 40+ tests
❌ Failed: 0 tests
Success Rate: 100%
```

**Action if failures:**
- Review failed tests in console
- Fix critical issues before continuing
- Document non-critical issues

**Export Results:**
```javascript
TestSuite.export()  // Downloads JSON file
```

**Status:** [ ] PASS / [ ] FAIL (_____ failures)

**Notes:** _______________________________________________

---

## Part 2: Core Transformation Testing (30 min)

### Test 2.1: Visual Diagram - Flowchart (5 min)

**Test Page:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions

**Steps:**
1. Navigate to test page
2. Right-click anywhere → "Transform with Learning Enhancer" → "📊 Generate Diagram"
3. Wait 10-15 seconds
4. Observe widget

**Check:**
- [ ] Widget appears and is draggable
- [ ] "📊 Diagram" tab is active
- [ ] Flowchart renders (shows function concepts)
- [ ] Can zoom in/out (Ctrl+Scroll)
- [ ] Can pan (drag)
- [ ] "Download SVG" button works
- [ ] "Copy Code" button copies Mermaid syntax
- [ ] No console errors

**Console should show:**
```
[MLE] Visual diagram generated successfully
```

**Timing:** _____ seconds (expect 8-15)

**Status:** [ ] PASS / [ ] FAIL

**Screenshot:** [ ] Captured

---

### Test 2.2: Summary - Bullet Points (5 min)

**Test Page:** https://en.wikipedia.org/wiki/Photosynthesis

**Steps:**
1. Navigate to test page
2. Right-click → "Transform with Learning Enhancer" → "📝 Create Summary (Bullet Points)"
3. Wait 5-10 seconds
4. Check widget

**Check:**
- [ ] Widget shows "📝 Summary" tab
- [ ] 5-10 bullet points displayed
- [ ] Points are relevant to photosynthesis
- [ ] Metadata shows: word count, reading time, compression ratio
- [ ] "Copy" button works
- [ ] No console errors

**Quality Check:**
- [ ] Bullet points are concise
- [ ] Key concepts captured (chlorophyll, sunlight, glucose)
- [ ] Grammar is correct

**Timing:** _____ seconds (expect 5-8)

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2.3: Study Notes (5 min)

**Test Page:** https://en.wikipedia.org/wiki/World_War_II

**Steps:**
1. Navigate to test page
2. Right-click → "Transform with Learning Enhancer" → "🎯 Create Study Notes"
3. Wait 10-15 seconds
4. Check widget

**Check:**
- [ ] Widget shows "🎯 Study Notes" tab
- [ ] Has structured sections (## Overview, ## Key Concepts, etc.)
- [ ] Metadata shows: word count, section count
- [ ] Content is well-organized
- [ ] "Copy" button works
- [ ] No console errors

**Quality Check:**
- [ ] Overview section exists
- [ ] Key concepts are relevant
- [ ] Important details included
- [ ] Markdown formatting correct

**Timing:** _____ seconds (expect 10-15)

**Status:** [ ] PASS / [ ] FAIL

**Screenshot:** [ ] Captured

---

### Test 2.4: Cornell Notes (NEW) (5 min)

**Test Page:** https://en.wikipedia.org/wiki/Climate_change

**Steps:**
1. Navigate to test page
2. Right-click → "Transform with Learning Enhancer" → "📔 Create Cornell Notes"
3. Wait 10-15 seconds
4. Check widget

**Check:**
- [ ] Widget shows "📔 Cornell Notes" tab
- [ ] Has "🔑 Cue Column | 📝 Notes" section
- [ ] At least 5 cue/note pairs present
- [ ] Cues are questions or key terms
- [ ] Notes are explanations/answers
- [ ] Has "📌 Summary" section at bottom
- [ ] Summary is 2-3 sentences
- [ ] Metadata shows: cue pairs count, ✓ Summary
- [ ] "Copy" button works
- [ ] No console errors

**Quality Check:**
- [ ] Cues prompt recall (good questions)
- [ ] Notes are informative
- [ ] Summary captures essence
- [ ] Format follows Cornell Notes structure

**Example Format:**
```markdown
### 🔑 Cue Column | 📝 Notes

**What is climate change?** | Climate change is the long-term...

**Key greenhouse gases?** | CO2, methane, nitrous oxide...

---

### 📌 Summary
Climate change is caused by... [comprehensive overview]
```

**Timing:** _____ seconds (expect 10-15)

**Status:** [ ] PASS / [ ] FAIL

**Screenshot:** [ ] Captured (IMPORTANT - this is new!)

---

### Test 2.5: Selected Text Transformation (5 min)

**Test Page:** https://en.wikipedia.org/wiki/Machine_learning

**Steps:**
1. Navigate to test page
2. **Select 3-4 paragraphs** from "Overview" section
3. Right-click on selection → "Transform with Learning Enhancer" → "📔 Create Cornell Notes"
4. Wait 10-15 seconds

**Check:**
- [ ] Cornell Notes generated from selection only (not whole page)
- [ ] Title reflects selected content
- [ ] Word count matches selection (~200-400 words)
- [ ] Quality is good despite smaller input

**Try with different transformation:**
5. Select same text
6. Generate "📝 Create Summary"

**Check:**
- [ ] Summary reflects selection only
- [ ] Compression ratio shown

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2.6: Tab Switching (5 min)

**Test Page:** Stay on current page

**Steps:**
1. Generate multiple transformations on same page:
   - Generate Diagram
   - Generate Summary
   - Generate Study Notes
   - Generate Cornell Notes
2. Widget should accumulate results

**Check:**
- [ ] All 4 tabs visible: 📊 📝 🎯 📔
- [ ] Can click each tab
- [ ] Correct content shown for each tab
- [ ] Active tab highlighted
- [ ] Previous results not lost when generating new ones

**Status:** [ ] PASS / [ ] FAIL

---

## Part 3: Path A Features (20 min)

### Test 3.1: Offline Mermaid (CDN Fallback) (5 min)

**Prerequisites:**
- Do NOT have lib/mermaid.min.js file
- Have internet connection

**Steps:**
1. Delete lib/mermaid.min.js if it exists
2. Navigate to: https://en.wikipedia.org/wiki/Algorithm
3. Generate diagram
4. Check console

**Expected Console Message:**
```
[VisualEngine] Mermaid.js loaded from CDN (requires internet)
```

**Check:**
- [ ] Console shows CDN load message
- [ ] Diagram renders successfully
- [ ] No errors

**Status:** [ ] PASS / [ ] FAIL

---

### Test 3.2: Offline Mermaid (Local File) (OPTIONAL) (10 min)

**Note:** This is optional but recommended for demo backup

**Prerequisites:**
- Follow docs/OFFLINE_SETUP.md to download mermaid.min.js
- Place in lib/ folder

**Steps:**
1. Download mermaid.min.js from CDN (see OFFLINE_SETUP.md)
2. Save as `lib/mermaid.min.js` in extension folder
3. Reload extension at chrome://extensions
4. **Disconnect internet** OR block cdn.jsdelivr.net in DevTools
5. Generate diagram

**Expected Console Message:**
```
[VisualEngine] Mermaid.js loaded from local file (offline mode enabled)
```

**Check:**
- [ ] Console shows local file load message
- [ ] Diagram renders WITHOUT internet
- [ ] No errors

**Status:** [ ] PASS / [ ] FAIL / [ ] SKIPPED

---

### Test 3.3: Improved Error Messages (5 min)

**Test 3.3a: API Not Available**

**Prerequisites:** Temporarily disable one API flag

**Steps:**
1. Go to chrome://flags
2. Disable `#prompt-api-for-gemini-nano`
3. Restart Chrome
4. Try generating Cornell Notes or Study Notes

**Expected Error:**
```
Chrome AI Prompt API is not available. Please ensure you have:
1. Chrome Dev/Canary (v128+)
2. Enabled chrome://flags/#prompt-api-for-gemini-nano
3. Downloaded Gemini Nano model
4. Restarted Chrome

See docs/API_ENABLE_INSTRUCTIONS.md for detailed setup.
```

**Check:**
- [ ] Error message is clear and actionable
- [ ] Lists specific steps to fix
- [ ] References documentation
- [ ] Shows in notification
- [ ] Full details in console

**Cleanup:**
5. Re-enable flag
6. Restart Chrome

**Status:** [ ] PASS / [ ] FAIL

---

**Test 3.3b: Content Extraction Error**

**Steps:**
1. Navigate to: https://www.google.com (minimal content)
2. Right-click (without selecting text)
3. Try generating transformation

**Expected Behavior:**
- Should either extract what's available, OR
- Show helpful error about unusual page format

**Check:**
- [ ] Error message is helpful (not cryptic)
- [ ] Provides suggestions
- [ ] Doesn't crash extension

**Status:** [ ] PASS / [ ] FAIL

---

## Part 4: History & Storage (10 min)

### Test 4.1: History Saving (3 min)

**Steps:**
1. Generate 3-4 different transformations
2. Click extension icon
3. Go to "History" tab

**Check:**
- [ ] All transformations appear in history
- [ ] Shows correct type icons (📊 📝 🎯 📔)
- [ ] Shows titles
- [ ] Shows timestamps
- [ ] Most recent appears first

**Status:** [ ] PASS / [ ] FAIL

---

### Test 4.2: History Search (2 min)

**Steps:**
1. In History tab, use search box
2. Search for keyword from one transformation
3. Verify filtering works

**Check:**
- [ ] Search filters results
- [ ] Matching items shown
- [ ] Non-matching items hidden
- [ ] Clear search restores all

**Status:** [ ] PASS / [ ] FAIL

---

### Test 4.3: History Delete (2 min)

**Steps:**
1. Hover over a history item
2. Click delete button (if visible) OR right-click
3. Confirm deletion

**Check:**
- [ ] Item is removed from history
- [ ] Other items remain
- [ ] No errors

**Status:** [ ] PASS / [ ] FAIL

---

### Test 4.4: History Export (3 min)

**Steps:**
1. Click "Export" button in History
2. Save JSON file
3. Open file in text editor

**Check:**
- [ ] File downloads
- [ ] Contains all transformations
- [ ] JSON is valid (not corrupted)
- [ ] Includes metadata

**Status:** [ ] PASS / [ ] FAIL

---

## Part 5: Edge Cases (15 min)

### Test 5.1: Very Short Content (3 min)

**Steps:**
1. Navigate to any page
2. Select just 1-2 sentences
3. Try generating Cornell Notes

**Check:**
- [ ] Either generates with limited pairs, OR
- [ ] Shows helpful error: "Content too short..."

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5.2: Very Long Content (3 min)

**Steps:**
1. Navigate to very long Wikipedia article (>5000 words)
2. Generate Study Notes (whole page)
3. Check console

**Expected Console:**
```
[TextTransformer] Content too long, summarizing first...
```

**Check:**
- [ ] Console shows summarizing message
- [ ] Transformation still completes
- [ ] Takes 15-20 seconds (longer than usual)
- [ ] Quality is still good

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5.3: Rapid Transformations (2 min)

**Steps:**
1. Click transformation option
2. Immediately click another transformation option
3. Repeat rapidly 3-4 times

**Expected Behavior:**
- Extension handles gracefully
- Shows "Already in progress" OR queues requests

**Check:**
- [ ] Doesn't crash
- [ ] Shows appropriate message
- [ ] Eventually processes all requests OR rejects properly

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5.4: Extension Reload (2 min)

**Steps:**
1. Generate a transformation
2. Go to chrome://extensions
3. Click "Reload" on extension
4. Return to page
5. Try new transformation

**Check:**
- [ ] Extension reinitializes
- [ ] New transformations work
- [ ] No console errors
- [ ] History is preserved

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5.5: Widget Dragging (2 min)

**Steps:**
1. Generate transformation to show widget
2. Drag widget by header to different positions:
   - Top left
   - Top right
   - Bottom left
   - Bottom right
   - Center

**Check:**
- [ ] Widget is draggable
- [ ] Stays within viewport bounds
- [ ] Doesn't disappear off-screen
- [ ] Position persists when switching tabs

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5.6: Page Navigation (3 min)

**Steps:**
1. Generate transformation
2. Widget is visible
3. Click a link to navigate to new page
4. What happens to widget?

**Expected Behavior:**
- Widget likely disappears (expected on navigation)
- No errors in console

**Check:**
- [ ] Extension doesn't crash
- [ ] Can generate new transformation on new page
- [ ] No errors

**Status:** [ ] PASS / [ ] FAIL

---

## Part 6: Screenshot Capture (10 min)

Capture high-quality screenshots for README and DevPost submission.

### Screenshot 6.1: Visual Diagram
**Page:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
**Transform:** 📊 Generate Diagram
**Capture:** Widget showing flowchart
**File name:** `screenshot-diagram-flowchart.png`
**Status:** [ ] Captured

---

### Screenshot 6.2: Cornell Notes (NEW!)
**Page:** https://en.wikipedia.org/wiki/Photosynthesis
**Transform:** 📔 Create Cornell Notes
**Capture:** Widget showing Cornell Notes with cue column and summary
**File name:** `screenshot-cornell-notes.png`
**Status:** [ ] Captured

---

### Screenshot 6.3: Study Notes
**Page:** https://en.wikipedia.org/wiki/Artificial_intelligence
**Transform:** 🎯 Create Study Notes
**Capture:** Widget showing structured study notes
**File name:** `screenshot-study-notes.png`
**Status:** [ ] Captured

---

### Screenshot 6.4: Multiple Tabs
**Page:** Any page with all 4 transformations generated
**Capture:** Widget showing all 4 tabs (📊 📝 🎯 📔)
**File name:** `screenshot-all-tabs.png`
**Status:** [ ] Captured

---

### Screenshot 6.5: Extension Popup
**Capture:** Extension popup showing green API status
**File name:** `screenshot-popup-status.png`
**Status:** [ ] Captured

---

### Screenshot 6.6: History View
**Capture:** History tab with several transformations
**File name:** `screenshot-history.png`
**Status:** [ ] Captured

---

## Part 7: Demo Scenario Rehearsal (10 min)

Practice the 3 main demo scenarios to ensure smooth presentation.

### Demo 7.1: Technical Tutorial → Flowchart
**Page:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
**Action:** Generate diagram
**Expected:** Flowchart of function concepts
**Timing:** _____ seconds
**Status:** [ ] PASS / [ ] FAIL

---

### Demo 7.2: Historical Article → Timeline
**Page:** https://en.wikipedia.org/wiki/World_War_II
**Action:** Generate diagram
**Expected:** Timeline with WW2 events
**Timing:** _____ seconds
**Status:** [ ] PASS / [ ] FAIL

---

### Demo 7.3: Educational Content → Cornell Notes
**Page:** https://en.wikipedia.org/wiki/Photosynthesis
**Action:** Generate Cornell Notes
**Expected:** Well-formatted Cornell Notes with cue pairs and summary
**Timing:** _____ seconds
**Status:** [ ] PASS / [ ] FAIL

**Demo readiness:** [ ] Ready / [ ] Needs work

---

## Final Checklist

Before moving to demo video creation:

### Functionality
- [ ] All 6 transformation types work
- [ ] Cornell Notes displays properly
- [ ] Error messages are helpful
- [ ] Offline mode works (or CDN fallback works)
- [ ] History saves/loads correctly
- [ ] Widget UI is clean
- [ ] No console errors during normal use

### Documentation
- [ ] README.md is accurate
- [ ] TROUBLESHOOTING.md is helpful
- [ ] OFFLINE_SETUP.md instructions work
- [ ] All documentation links functional

### Quality
- [ ] Transformations produce good quality output
- [ ] Timing is acceptable (8-15 sec for diagrams, 5-15 for text)
- [ ] No crashes or hangs
- [ ] Professional appearance

### Demo Prep
- [ ] 6 screenshots captured
- [ ] Demo scenarios tested and timed
- [ ] Backup plan if internet fails (offline mode)
- [ ] Know how to showcase Cornell Notes

---

## Test Summary

**Date:** _____________________
**Tester:** _____________________
**Chrome Version:** _____________________
**Extension Version:** Day 8 - Path A Complete

### Results

**Automated Tests:** _____ / _____ passed
**Manual Tests:** _____ / _____ passed
**Screenshots:** _____ / 6 captured

### Critical Issues Found
1.
2.
3.

### Non-Critical Issues
1.
2.
3.

### Overall Status
- [ ] ✅ READY FOR DEMO
- [ ] ⚠️  NEEDS FIXES
- [ ] ❌ MAJOR ISSUES

---

## Time Tracking

- Automated tests: _____ min
- Core transformations: _____ min
- Path A features: _____ min
- Edge cases: _____ min
- Screenshots: _____ min
- Demo rehearsal: _____ min

**Total:** _____ min

---

**Next Step:** If all tests pass, proceed to demo video creation!
