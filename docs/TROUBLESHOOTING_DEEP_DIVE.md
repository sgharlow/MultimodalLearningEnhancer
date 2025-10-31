# 🔧 Deep Troubleshooting Guide - Chrome AI Not Working

## 🎯 Quick Diagnostic Page

I created a **visual diagnostic tool** for you:

1. Open this file in Chrome: `DIAGNOSE_AI.html`
2. Click through each step to see exactly what's wrong
3. It will show you the status of EVERYTHING

---

## 📍 Where to Check Model Status (Hidden Chrome Pages)

### **Method 1: Chrome Components Page (BEST)**

1. Go to: `chrome://components`
2. Look for **"Optimization Guide On Device Model"**
3. Check the status:
   - **"Up to date"** = Model downloaded ✅
   - **"Downloading..."** = Download in progress ⏳
   - **"Component not updated"** or missing = Model NOT downloaded ❌
4. If status is old or missing, click **"Check for update"** button

### **Method 2: DevTools Console (PRECISE)**

Open DevTools Console (F12) and run these commands:

#### Check if Prompt API exists:
```javascript
typeof ai
// Should return: "object" (not "undefined")
```

#### Check capabilities:
```javascript
await ai.languageModel.capabilities()
```

**Expected output:**
```json
{
  "available": "readily",  // ✅ This means READY
  "defaultTemperature": 0.8,
  "defaultTopK": 3,
  "maxTopK": 8
}
```

**If you see:**
- `"available": "readily"` → ✅ Model is ready
- `"available": "after-download"` → ⚠️ Need to download
- `"available": "no"` → ❌ Not supported
- Error: `ai is not defined` → ❌ Flags not enabled

#### Force download model:
```javascript
await ai.languageModel.create()
```

**Watch for:**
- Success → Model downloads in background
- Error about "download in progress" → Already downloading, wait
- Error about "not available" → Check flags

### **Method 3: Chrome Flags Status**

1. Go to: `chrome://flags`
2. Type "gemini" in search box
3. Verify EXACTLY these settings:

```
prompt-api-for-gemini-nano → Enabled
summarization-api-for-gemini-nano → Enabled
writer-api-for-gemini-nano → Enabled
rewriter-api-for-gemini-nano → Enabled
optimization-guide-on-device-model → Enabled BypassPerfRequirement
```

**CRITICAL:** Must be "Enabled", not "Default" or "Disabled"

---

## 🔍 Step-by-Step Deep Diagnostic

### **Step 1: Verify Chrome Version**

Run in console:
```javascript
navigator.userAgent.match(/Chrome\/(\d+)/)?.[1]
```

**Need:** Version **128 or higher**
**Channel:** Dev or Canary (NOT stable)

**If wrong version:**
- Download Chrome Dev: https://www.google.com/chrome/dev/
- Download Chrome Canary: https://www.google.com/chrome/canary/

---

### **Step 2: Check Each API Individually**

#### Prompt API (Most Important):
```javascript
// Check if exists
console.log('ai exists:', typeof ai !== 'undefined');
console.log('ai.languageModel exists:', typeof ai?.languageModel !== 'undefined');

// Check capabilities
await ai.languageModel.capabilities()

// Try creating session
const session = await ai.languageModel.create();
console.log('Session created:', session);
await session.destroy();
```

#### Summarizer API:
```javascript
// Check if exists
console.log('Summarizer exists:', typeof Summarizer !== 'undefined');

// Check availability
await Summarizer.availability()
// Should return: "readily" or "available"

// Try creating summarizer
const summarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  sharedContext: 'en'
});
console.log('Summarizer created:', summarizer);
```

#### Check ai.summarizer (newer API):
```javascript
console.log('ai.summarizer exists:', typeof ai?.summarizer !== 'undefined');
await ai.summarizer.capabilities()
```

---

### **Step 3: Model Download Status**

#### Check if model is downloading:
```javascript
// This will error if model is still downloading
try {
  const session = await ai.languageModel.create();
  console.log('✅ Model ready!');
  await session.destroy();
} catch (e) {
  console.error('Model status:', e.message);
  // Look for phrases like "download in progress" or "not available"
}
```

#### Force re-download (if corrupted):
```javascript
// This initiates download
await ai.languageModel.create()
```

**Monitor in `chrome://components`** - look for "Optimization Guide On Device Model" download progress

---

### **Step 4: Check for Common Errors**

#### Error: "ai is not defined"
**Cause:** Flags not enabled or Chrome not restarted
**Fix:**
1. Go to `chrome://flags`
2. Enable `#prompt-api-for-gemini-nano`
3. Click **Relaunch** (not just close/reopen)

#### Error: "languageModel is not a function"
**Cause:** Using wrong API version
**Fix:** Try both:
```javascript
// Old API
await window.ai.languageModel.create()

// New API (Chrome 143+)
await ai.languageModel.create()
```

#### Error: "Model download in progress"
**Fix:** Wait 10-20 minutes, check `chrome://components`

#### Error: "Not available on this device"
**Cause:** Insufficient RAM or CPU
**Requirements:**
- RAM: 8GB+ recommended (4GB minimum)
- Storage: 2GB free space
- CPU: Modern x64 processor

---

## 🛠️ Nuclear Options (If Nothing Works)

### **Option 1: Complete Reset**

1. **Backup your data** (bookmarks, etc.)
2. Close Chrome completely
3. Delete Chrome AI cache:
   - Windows: `%LOCALAPPDATA%\Google\Chrome Dev\User Data\OptimizationGuidePredictionModels`
   - Mac: `~/Library/Application Support/Google/Chrome Dev/OptimizationGuidePredictionModels`
4. Restart Chrome Dev
5. Re-enable ALL flags
6. Relaunch
7. Run in console: `await ai.languageModel.create()`
8. Wait for fresh download

### **Option 2: Fresh Chrome Profile**

1. Go to `chrome://settings/people`
2. Click "Add person"
3. Create new profile
4. In new profile:
   - Enable all AI flags
   - Restart
   - Download model
   - Test with `DIAGNOSE_AI.html`

### **Option 3: Different Chrome Channel**

If using Chrome Dev, try Chrome Canary (or vice versa)
- Sometimes one channel works better than the other
- Model availability varies by channel

---

## 📊 Where to See Detailed Status

### **Best Places to Check:**

1. **`chrome://components`**
   - Look for: "Optimization Guide On Device Model"
   - Shows download progress and version

2. **DevTools Console** (F12)
   - Run diagnostic commands above
   - See exact error messages

3. **`chrome://flags`**
   - Verify all 5 flags are "Enabled"
   - NOT "Default"

4. **Your Extension Popup**
   - Open extension
   - Check 4 status indicators
   - Should all be green ✅

---

## 🎯 Most Common Issues & Fixes

### Issue 1: Flags Reset After Chrome Update
**Symptoms:** Was working yesterday, not today
**Fix:** Re-enable all 5 flags, click Relaunch

### Issue 2: Model Download Stuck
**Symptoms:** "Download in progress" for hours
**Fix:**
1. Go to `chrome://components`
2. Find "Optimization Guide On Device Model"
3. Click "Check for update"
4. Wait 5 minutes
5. If still stuck, try "Nuclear Option 1" above

### Issue 3: Extension Shows APIs Not Available
**Symptoms:** Red/yellow status in popup
**Fix:**
1. Reload extension at `chrome://extensions`
2. Refresh webpage
3. Check console for specific API errors
4. Verify flags are enabled

### Issue 4: Works in Console But Not in Extension
**Symptoms:** `await ai.languageModel.create()` works, but extension doesn't
**Fix:**
1. Reload extension (critical!)
2. Hard refresh webpage (Ctrl+Shift+R)
3. Check extension console for errors
4. Verify `page-injector.js` is running

---

## 🚨 Emergency Diagnostic Commands

**Run these in order, stop when you find the problem:**

```javascript
// 1. Basic check
console.log('ai:', typeof ai);
// Should be: "object"

// 2. Check API
console.log('languageModel:', typeof ai?.languageModel);
// Should be: "object"

// 3. Check capabilities
await ai.languageModel.capabilities()
// Should return object with "available": "readily"

// 4. Try create session
const s = await ai.languageModel.create();
console.log('Session:', s);
await s.destroy();
// Should succeed

// 5. Try actual prompt
const s2 = await ai.languageModel.create();
const r = await s2.prompt('Say hello');
console.log('Response:', r);
await s2.destroy();
// Should return AI response
```

**At which step does it fail? That's your problem!**

---

## 📞 Final Checklist

Before giving up, verify ALL of these:

- [ ] Chrome Dev/Canary installed (NOT stable)
- [ ] Version 128 or higher (`chrome://version`)
- [ ] All 5 flags enabled (`chrome://flags`)
- [ ] Chrome restarted after enabling flags
- [ ] Model shows "Up to date" (`chrome://components`)
- [ ] `await ai.languageModel.capabilities()` returns `"available": "readily"`
- [ ] Extension reloaded (`chrome://extensions`)
- [ ] Webpage hard refreshed (Ctrl+Shift+R)
- [ ] DevTools console shows no errors about "ai not defined"
- [ ] Opened `DIAGNOSE_AI.html` and all checks pass

---

## 💡 Quick Reference Commands

**Copy-paste these into Console to diagnose:**

```javascript
// ALL-IN-ONE DIAGNOSTIC
(async () => {
  console.log('=== CHROME AI DIAGNOSTIC ===');
  console.log('1. Chrome Version:', navigator.userAgent.match(/Chrome\/(\d+)/)?.[1]);
  console.log('2. ai exists:', typeof ai !== 'undefined');
  console.log('3. ai.languageModel exists:', typeof ai?.languageModel !== 'undefined');

  if (typeof ai !== 'undefined' && ai.languageModel) {
    try {
      const cap = await ai.languageModel.capabilities();
      console.log('4. Capabilities:', cap);
      console.log('5. Model status:', cap.available);

      if (cap.available === 'readily') {
        const session = await ai.languageModel.create();
        console.log('6. Session created: ✅');
        const result = await session.prompt('Say "Working!"');
        console.log('7. Test prompt result:', result);
        await session.destroy();
        console.log('=== ✅ EVERYTHING WORKS! ===');
      } else {
        console.log('⚠️ Model not ready. Status:', cap.available);
      }
    } catch (e) {
      console.error('❌ Error:', e.message);
    }
  } else {
    console.error('❌ Prompt API not available. Check flags!');
  }
})();
```

---

**Use `DIAGNOSE_AI.html` for a visual, step-by-step check of everything!**
