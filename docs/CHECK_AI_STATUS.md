# 🔧 Quick AI Status Check

Your extension stopped working because **Chrome AI APIs are not available**.

## Quick Fix (5 minutes):

### Step 1: Check Chrome Version
1. Go to `chrome://version`
2. Make sure you're using **Chrome Dev** or **Chrome Canary**
3. Version should be **128+**

### Step 2: Re-enable AI Flags
Chrome updates sometimes reset flags. Re-enable them:

1. Go to `chrome://flags`
2. Search for and enable **ALL** of these:
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#summarization-api-for-gemini-nano` → **Enabled**
   - `#writer-api-for-gemini-nano` → **Enabled**
   - `#rewriter-api-for-gemini-nano` → **Enabled**
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**

3. Click **Relaunch** button

### Step 3: Verify Gemini Nano Model
1. Open DevTools Console (F12)
2. Run this command:
   ```javascript
   await ai.languageModel.capabilities()
   ```
3. **If you see an error:** Model needs to be downloaded
   ```javascript
   await ai.languageModel.create()
   ```
   Wait for ~1.7GB download (10-20 minutes)

### Step 4: Reload Extension
1. Go to `chrome://extensions`
2. Find "Multimodal Learning Enhancer"
3. Click the **reload** icon (circular arrow)
4. Refresh any webpage

### Step 5: Verify It's Working
1. Open extension popup
2. Check if all 4 API status indicators are **green** ✅
3. If not, check console for specific errors

---

## Why This Happened:

**Most likely causes:**
- Chrome updated and reset your flags (common)
- Chrome switched from Dev to Stable accidentally
- Gemini Nano model was cleared from cache

---

## Still Not Working?

Check console errors and look for:
- `typeof ai: undefined` → Flags not enabled
- `Model download in progress` → Wait for download
- `APIs not available` → Wrong Chrome version

See full instructions: `docs/API_ENABLE_INSTRUCTIONS.md`
