# 🔌 Offline Mermaid.js Setup (Optional)

The extension works with internet connection by default (loads Mermaid from CDN).

For **offline functionality**, follow these steps:

## Quick Setup (2 minutes)

### 1. Download Mermaid.js

Download the latest Mermaid.js file:
- **URL:** https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js
- **Save as:** `lib/mermaid.min.js`

**Using command line:**
```bash
cd LearnMyWay/lib
curl -o mermaid.min.js https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js
```

**Or using browser:**
1. Open https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js
2. Save page as `mermaid.min.js`
3. Move to `LearnMyWay/lib/` folder

### 2. Reload Extension

1. Go to `chrome://extensions`
2. Find "Multimodal Learning Enhancer"
3. Click reload button 🔄

### 3. Verify Offline Mode

1. Disconnect from internet
2. Load extension
3. Try generating a diagram
4. It should work offline! ✓

## File Structure

```
LearnMyWay/
├── lib/
│   ├── mermaid.min.js          ← Add this file (optional)
│   ├── chrome-ai-apis.js
│   ├── visual-engine.js        ← Already configured for offline
│   └── ... other files
```

## How It Works

The extension now uses a **hybrid loading strategy**:

1. **Try Local First:** Attempts to load `lib/mermaid.min.js`
2. **Fallback to CDN:** If local file not found, loads from CDN
3. **Works Either Way:** No configuration needed

**Benefits of offline mode:**
- ✅ Faster loading (no CDN fetch)
- ✅ Works without internet
- ✅ More reliable
- ✅ Privacy-friendly (no external requests)

**Without offline setup:**
- ✅ Extension still works fine
- ⚠️ Requires internet for diagrams
- ⚠️ Slightly slower (CDN fetch)

## Troubleshooting

**Diagrams not rendering offline?**
- Check if `lib/mermaid.min.js` exists
- Check file size (should be ~500KB)
- Reload extension after adding file
- Check console for errors

**Still not working?**
- Extension falls back to CDN automatically
- Check internet connection
- Check console for detailed error messages

## File Details

**Expected file:**
- Name: `mermaid.min.js`
- Location: `LearnMyWay/lib/`
- Size: ~500-600 KB
- Version: 10.x or higher

**Checksum (optional verification):**
You can verify the downloaded file is correct by checking it's a valid JavaScript file that defines `window.mermaid`.

## Clean Up

To remove offline mode and use CDN only:
```bash
rm lib/mermaid.min.js
```

Extension will automatically fallback to CDN.
