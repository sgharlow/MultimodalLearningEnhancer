# 🔧 Troubleshooting Guide

Common issues and solutions for Multimodal Learning Enhancer

---

## Table of Contents

1. [Chrome AI API Errors](#chrome-ai-api-errors)
2. [Transformation Failures](#transformation-failures)
3. [Content Extraction Issues](#content-extraction-issues)
4. [Diagram Rendering Problems](#diagram-rendering-problems)
5. [Performance Issues](#performance-issues)
6. [Storage Issues](#storage-issues)

---

## Chrome AI API Errors

### "Chrome AI APIs not available"

**Symptoms:**
- Extension popup shows red status indicators
- Transformations fail immediately
- Error mentions "API not available"

**Solutions:**

1. **Check Chrome Version**
   - You need Chrome Dev or Canary (version 128+)
   - Download from:
     - Chrome Dev: https://www.google.com/chrome/dev/
     - Chrome Canary: https://www.google.com/chrome/canary/

2. **Enable Required Flags**
   - Go to `chrome://flags`
   - Enable these flags:
     ```
     #prompt-api-for-gemini-nano
     #summarization-api-for-gemini-nano
     #writer-api-for-gemini-nano
     #rewriter-api-for-gemini-nano
     #optimization-guide-on-device-model → "Enabled BypassPerfRequirement"
     ```
   - **Restart Chrome completely**

3. **Download Gemini Nano Model**
   - Open DevTools Console (F12)
   - Run: `await ai.languageModel.create();`
   - Wait for download (~1.7 GB)
   - You'll see a download progress indicator
   - Once complete, verify by running: `await ai.languageModel.capabilities();`
   - Should show `available: "readily"`

4. **Verify Setup**
   - Refresh the extension
   - Click the extension icon (🧠)
   - All 4 status indicators should be green
   - If still red, try:
     - Completely closing and restarting Chrome
     - Clearing browser cache
     - Reinstalling the extension

**See Also:** [API_ENABLE_INSTRUCTIONS.md](API_ENABLE_INSTRUCTIONS.md) for detailed setup

---

## Transformation Failures

### "Transformation failed" or "Generation failed"

**Common Causes:**

1. **AI Model Busy**
   - The Gemini Nano model can only process one request at a time
   - **Solution:** Wait a few seconds and try again

2. **Content Too Short**
   - Selected text is too brief for meaningful transformation
   - **Solution:** Select at least 2-3 paragraphs (100+ words)

3. **Content Too Long**
   - Very long content may timeout
   - **Solution:**
     - Select a specific section instead of entire page
     - The extension automatically summarizes content >10,000 characters

4. **Incompatible Content**
   - Some content types don't work well with certain transformations
   - **Solution:**
     - Try a different transformation type
     - Text-heavy content → Use Summary or Study Notes
     - Process-based content → Use Diagram (Flowchart)
     - Conceptual content → Use Diagram (Mind Map)
     - Historical content → Use Diagram (Timeline)

### "Prompt API not available" for Study Notes/Cornell Notes

**Cause:** Study Notes and Cornell Notes require the Prompt API specifically

**Solution:**
1. Ensure `chrome://flags/#prompt-api-for-gemini-nano` is enabled
2. Restart Chrome
3. Try Summary transformation as alternative (uses Summarizer API)

---

## Content Extraction Issues

### "No text selected" Error

**Solutions:**
1. **If you selected text:**
   - Selection may have been cleared
   - Re-select the text
   - Right-click on the selected text (not elsewhere)

2. **If you want the entire page:**
   - Right-click anywhere on the page (without selecting text)
   - Choose transformation option
   - Extension will auto-extract main content

### "Failed to extract content from this page"

**Common Causes:**
1. **Unusual Page Format**
   - Page uses uncommon HTML structure
   - **Solution:** Select specific text manually

2. **Content Behind Login**
   - Protected content may not be extractable
   - **Solution:** Log in first, then try again

3. **Mostly Non-Text Content**
   - Pages with mainly images/videos
   - **Solution:** Look for text descriptions or summaries

4. **Dynamic/JavaScript Content**
   - Content loaded after page load
   - **Solution:**
     - Wait for page to fully load
     - Refresh the page
     - Select visible text manually

---

## Diagram Rendering Problems

### "Failed to render diagram" or "Mermaid syntax error"

**Cause:** The AI generated invalid Mermaid syntax

**Solutions:**
1. **Try Again**
   - Click the transformation button again
   - The AI may generate different (valid) syntax

2. **Try Different Content**
   - Some content doesn't map well to diagrams
   - Try a clearer, more structured section

3. **Use Different Diagram Type**
   - If Flowchart fails, try Mind Map
   - Different types have different syntax requirements

4. **Check Internet Connection**
   - Diagrams require internet by default (loads Mermaid.js from CDN)
   - **Alternative:** Set up offline mode (see [OFFLINE_SETUP.md](OFFLINE_SETUP.md))

### Diagram Doesn't Appear / Blank Screen

**Solutions:**
1. **Check Browser Console**
   - Press F12
   - Look for errors in Console tab
   - Common issues:
     - Network error → Check internet connection
     - Mermaid load error → See offline setup

2. **Refresh Widget**
   - Close the widget
   - Try transformation again

3. **Clear Extension Cache**
   - Go to `chrome://extensions`
   - Find "Multimodal Learning Enhancer"
   - Click "Remove"
   - Reload the extension

---

## Performance Issues

### Transformations Take Too Long (>30 seconds)

**Normal Processing Times:**
- Visual Diagrams: 8-15 seconds
- Summary: 5-8 seconds
- Study Notes: 10-15 seconds
- Cornell Notes: 10-15 seconds

**If Slower:**
1. **Content Length**
   - Very long content takes longer
   - Extension auto-summarizes content >10,000 chars
   - **Solution:** Select smaller sections

2. **System Resources**
   - AI model is resource-intensive
   - **Solution:**
     - Close unnecessary tabs
     - Ensure sufficient RAM (8GB+ recommended)

3. **Model Downloading**
   - First use may trigger model download
   - **Solution:** Wait for download to complete

### Extension Slows Down Browser

**Solutions:**
1. **Disable When Not Needed**
   - Click extension icon to toggle off
   - Only enable when actively using

2. **Clear History**
   - Extension stores up to 100 transformations
   - Go to popup → History → Clear All
   - Or delete individual items

3. **Restart Browser**
   - Clears memory usage
   - Refreshes AI model

---

## Storage Issues

### "Storage quota exceeded" Error

**Cause:** Extension stores transformations locally (limit: 100 items)

**Solutions:**
1. **Clear Old Transformations**
   - Click extension icon
   - Go to History tab
   - Click "Clear All" or delete specific items

2. **Export Before Clearing**
   - History → Export to JSON
   - Save file for later reference
   - Then clear history

### "Import failed" Error

**Solutions:**
1. **Verify JSON Format**
   - File must be from extension's Export feature
   - Should contain `transformations` array
   - Check file isn't corrupted

2. **Check File Size**
   - Very large exports may fail
   - Try importing in smaller batches

---

## Getting Help

If your issue isn't listed here:

1. **Check Console Logs**
   - Press F12
   - Look for `[MLE]` tagged messages
   - Error details often shown here

2. **Verify Setup**
   - Ensure all flags enabled at `chrome://flags`
   - Ensure Gemini Nano downloaded
   - Ensure Chrome Dev/Canary (v128+)

3. **Try Basic Troubleshooting**
   - Refresh the page
   - Restart Chrome completely
   - Reinstall the extension
   - Try different webpage

4. **Report Issue**
   - Include:
     - Chrome version
     - Error message (full text)
     - Console logs
     - Steps to reproduce

---

## Common Questions

**Q: Do I need internet?**
A: Yes, for diagram rendering (Mermaid.js CDN). Optionally set up offline mode: [OFFLINE_SETUP.md](OFFLINE_SETUP.md)

**Q: Why does it take 5-15 seconds?**
A: The AI model runs locally on your device and processes complex transformations. This is normal.

**Q: Is my data private?**
A: Yes! All processing happens locally in your browser. Nothing is sent to external servers (except Mermaid.js CDN for diagrams).

**Q: Can I use this on mobile?**
A: No, Chrome AI APIs are only available on desktop Chrome Dev/Canary.

**Q: Why Chrome Dev/Canary only?**
A: Chrome Built-in AI APIs are experimental features currently only available in pre-release Chrome versions.

---

**Still having issues?** See [API_ENABLE_INSTRUCTIONS.md](API_ENABLE_INSTRUCTIONS.md) for detailed setup guide.
