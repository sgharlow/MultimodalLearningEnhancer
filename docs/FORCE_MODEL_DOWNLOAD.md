# 🔄 Force Fresh Gemini Nano Model Download

## 🎯 IMMEDIATE COMMANDS - Run These Now

### **Command 1: Check if Model Exists**
Open DevTools Console (F12) and run:

```javascript
await ai.languageModel.capabilities()
```

**Interpret the result:**
- `{available: "readily"}` → ✅ Model downloaded and ready
- `{available: "after-download"}` → ❌ Model needs download
- `{available: "no"}` → ❌ Not supported on this device
- Error: "ai is not defined" → ❌ Flags not enabled

---

### **Command 2: Force Download**
```javascript
await ai.languageModel.create()
```

**What happens:**
- ✅ Success + returns object → Model downloaded, session created
- ⏳ Error with "download" → Download started, wait 10-20 min
- ❌ Error: "ai not defined" → Enable flags first

---

### **Command 3: Check Download Progress**
Run this every few minutes to monitor:

```javascript
(async () => {
  try {
    const caps = await ai.languageModel.capabilities();
    console.log('Status:', caps.available);

    if (caps.available === 'readily') {
      console.log('✅ MODEL READY!');
      // Try creating session to verify
      const session = await ai.languageModel.create();
      console.log('✅ Session created successfully!');
      await session.destroy();
    } else if (caps.available === 'after-download') {
      console.log('⏳ Model needs download. Starting...');
      const session = await ai.languageModel.create();
    } else {
      console.log('❌ Model not available:', caps.available);
    }
  } catch (e) {
    console.log('⚠️ Error:', e.message);
    if (e.message.includes('download')) {
      console.log('📥 Download in progress... check back in 5-10 minutes');
    }
  }
})();
```

---

## 📍 Physical Model Location on Disk

### **Windows - Check if Files Exist:**

1. Open File Explorer
2. Paste this path in address bar:
```
%LOCALAPPDATA%\Google\Chrome Dev\User Data\OptimizationGuidePredictionModels
```

3. Or manually navigate to:
```
C:\Users\[YourUsername]\AppData\Local\Google\Chrome Dev\User Data\OptimizationGuidePredictionModels
```

**What to look for:**
- **Folder exists with files** → Model is downloaded
- **Folder empty** → Model downloading or not started
- **Folder doesn't exist** → Model never downloaded

**Check file sizes:**
- Should see files totaling **~1.7 GB**
- Multiple `.tflite` files or similar

---

### **Mac - Check if Files Exist:**

1. Open Finder
2. Press `Cmd+Shift+G` (Go to Folder)
3. Paste this path:
```
~/Library/Application Support/Google/Chrome Dev/OptimizationGuidePredictionModels
```

**What to look for:**
- Files totaling ~1.7 GB = downloaded
- Empty = not downloaded

---

## 🗑️ COMPLETE MODEL REMOVAL & FRESH DOWNLOAD

### **Method 1: Delete Model Folder (Most Reliable)**

#### Windows:
```batch
1. Close Chrome COMPLETELY (check Task Manager - no Chrome processes)

2. Open File Explorer and paste this path:
   %LOCALAPPDATA%\Google\Chrome Dev\User Data

3. Find and DELETE this folder:
   OptimizationGuidePredictionModels

4. Restart Chrome Dev

5. Verify flags still enabled at chrome://flags

6. Open console and run:
   await ai.languageModel.create()

7. Monitor download at chrome://components
```

#### Mac:
```bash
1. Close Chrome completely

2. Open Terminal and run:
   rm -rf ~/Library/Application\ Support/Google/Chrome\ Dev/OptimizationGuidePredictionModels

3. Restart Chrome Dev

4. Verify flags at chrome://flags

5. Run in console:
   await ai.languageModel.create()
```

---

### **Method 2: Via Chrome Components (Less Reliable)**

1. Go to: `chrome://components`

2. Find: **"Optimization Guide On Device Model"**

3. Current status shown - could be:
   - "Component not updated"
   - "Version X.X.X" with date

4. Click: **"Check for update"**

5. Wait 2-3 minutes

6. Refresh the page

7. Look for status change to "Checking for update" or "Downloading"

**Note:** This doesn't always trigger a full re-download.

---

## 📊 Monitor Download in Real-Time

### **Method 1: Chrome Components Page**

1. Open: `chrome://components`
2. Find: "Optimization Guide On Device Model"
3. Refresh page every 30 seconds
4. Watch status change from:
   - "Checking for update..." → "Downloading..." → "Up-to-date"

### **Method 2: Via Console (More Detailed)**

Create a monitoring loop:

```javascript
// Run this to check status every 30 seconds
const checkInterval = setInterval(async () => {
  try {
    const caps = await ai.languageModel.capabilities();
    const timestamp = new Date().toLocaleTimeString();

    console.log(`[${timestamp}] Model status: ${caps.available}`);

    if (caps.available === 'readily') {
      console.log('✅ MODEL READY! Stopping monitor.');
      clearInterval(checkInterval);

      // Verify it works
      const session = await ai.languageModel.create();
      const result = await session.prompt('Say "Working!"');
      console.log('Test result:', result);
      await session.destroy();
    }
  } catch (e) {
    console.log(`⏳ Still downloading... (${e.message.substring(0, 50)}...)`);
  }
}, 30000); // Check every 30 seconds

console.log('🔍 Monitoring model download... will auto-stop when ready');
console.log('(To stop manually: clearInterval(checkInterval))');
```

### **Method 3: Check Disk Space Usage**

**Windows PowerShell:**
```powershell
# Check folder size (run in PowerShell)
Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome Dev\User Data\OptimizationGuidePredictionModels" -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="Size(GB)";Expression={[math]::Round($_.Sum / 1GB, 2)}}
```

**Mac Terminal:**
```bash
# Check folder size
du -sh ~/Library/Application\ Support/Google/Chrome\ Dev/OptimizationGuidePredictionModels
```

**Expected size:** ~1.7 GB when complete

---

## 🔥 Advanced: Force Download via Chrome Flags

Sometimes the model won't download because Chrome thinks it's already done. Force a fresh attempt:

### **Step 1: Reset Download State**

1. Go to: `chrome://flags`

2. Find: `optimization-guide-on-device-model`

3. Change to: **"Disabled"**

4. Click: **"Relaunch"**

5. Wait 1 minute after restart

6. Go back to: `chrome://flags`

7. Find: `optimization-guide-on-device-model`

8. Change to: **"Enabled BypassPerfRequirement"**

9. Click: **"Relaunch"** again

10. Wait 2 minutes

11. Go to: `chrome://components`

12. Find: "Optimization Guide On Device Model"

13. Click: **"Check for update"**

14. Run in console: `await ai.languageModel.create()`

---

## 🧪 Test if Model is Actually Working

### **Quick Test:**
```javascript
const session = await ai.languageModel.create();
const result = await session.prompt('What is 2+2? Answer in one word.');
console.log('AI Response:', result);
await session.destroy();
```

**Expected:** AI responds with "Four" or "4"

### **Full Test:**
```javascript
(async () => {
  console.log('=== FULL MODEL TEST ===\n');

  // 1. Check capabilities
  const caps = await ai.languageModel.capabilities();
  console.log('1. Capabilities:', caps);
  console.log('   Status:', caps.available, caps.available === 'readily' ? '✅' : '❌');

  // 2. Create session
  console.log('\n2. Creating session...');
  const session = await ai.languageModel.create();
  console.log('   Session created ✅');

  // 3. Test simple prompt
  console.log('\n3. Testing simple prompt...');
  const result1 = await session.prompt('Say "Hello"');
  console.log('   Response:', result1);

  // 4. Test complex prompt
  console.log('\n4. Testing complex prompt...');
  const result2 = await session.prompt('Generate a 3-item bullet list about AI');
  console.log('   Response:', result2);

  // 5. Cleanup
  await session.destroy();
  console.log('\n✅ ALL TESTS PASSED - Model is working perfectly!');
})();
```

---

## 📋 Checklist for Fresh Download

Before attempting fresh download, verify:

- [ ] Using Chrome Dev or Canary (NOT Stable)
- [ ] Version 128+ (`chrome://version`)
- [ ] All 5 flags enabled (`chrome://flags`)
- [ ] Chrome fully restarted after enabling flags
- [ ] At least 3GB free disk space
- [ ] Stable internet connection
- [ ] Not on metered connection (mobile hotspot)

**Then:**

- [ ] Delete OptimizationGuidePredictionModels folder
- [ ] Restart Chrome
- [ ] Verify flags still enabled
- [ ] Run `await ai.languageModel.create()`
- [ ] Monitor at `chrome://components`
- [ ] Wait 10-20 minutes
- [ ] Test with commands above

---

## ⏱️ How Long Should Download Take?

**Expected time:** 10-20 minutes on decent broadband

**Factors:**
- Internet speed (need ~1.7 GB download)
- Chrome's download throttling
- Server availability

**If taking longer than 30 minutes:**
- Check `chrome://components` - is it actually downloading?
- Check disk space - need 3GB free
- Check internet connection
- Try the "Nuclear Option" below

---

## 💣 NUCLEAR OPTION: Complete Reset

If nothing works, completely reset Chrome AI:

### **Full Reset Procedure:**

1. **Close Chrome completely**
   - Check Task Manager (Windows) or Activity Monitor (Mac)
   - Kill all Chrome processes

2. **Delete ALL AI-related data:**

   **Windows:**
   ```
   Delete these folders:
   %LOCALAPPDATA%\Google\Chrome Dev\User Data\OptimizationGuidePredictionModels
   %LOCALAPPDATA%\Google\Chrome Dev\User Data\optimization_guide_model_store
   %LOCALAPPDATA%\Google\Chrome Dev\User Data\optimization_guide_hint_cache_store
   ```

   **Mac:**
   ```bash
   rm -rf ~/Library/Application\ Support/Google/Chrome\ Dev/OptimizationGuidePredictionModels
   rm -rf ~/Library/Application\ Support/Google/Chrome\ Dev/optimization_guide_*
   ```

3. **Restart Chrome Dev**

4. **Re-enable ALL flags:**
   - `chrome://flags`
   - Enable all 5 AI flags
   - **Relaunch**

5. **Force download:**
   ```javascript
   await ai.languageModel.create()
   ```

6. **Wait and monitor:**
   - Open `chrome://components`
   - Watch "Optimization Guide On Device Model"
   - Wait for "Up-to-date" status

---

## 🆘 If Model STILL Won't Download

Try these alternatives:

### **Option 1: Different Chrome Channel**

If using Chrome Dev, try Chrome Canary (or vice versa):
- Download Chrome Canary: https://www.google.com/chrome/canary/
- Install separately (can run both)
- Enable flags in Canary
- Test model download there

### **Option 2: New Chrome Profile**

Sometimes profile corruption prevents download:

1. Go to: `chrome://settings/people`
2. Click: "Add person"
3. Create new profile
4. In new profile:
   - Enable all AI flags
   - Restart
   - Download model
   - Test

### **Option 3: Check System Requirements**

Model won't download if:
- RAM < 4GB (8GB recommended)
- Disk space < 3GB free
- CPU too old (needs AVX2 support)
- Windows < 10 or macOS < 11

**Check your system:**
```javascript
// Check available memory
navigator.deviceMemory // Should be 8+ GB
```

---

## 📞 What to Report Back

After trying these steps, report:

1. **Chrome Components status:**
   - Go to `chrome://components`
   - Screenshot "Optimization Guide On Device Model" section

2. **Console command results:**
   ```javascript
   await ai.languageModel.capabilities()
   ```
   - Copy the full output

3. **Folder check:**
   - Does OptimizationGuidePredictionModels folder exist?
   - What's the size?
   - How many files inside?

4. **Error messages:**
   - Any errors in console when running commands
   - Copy exact error text

With this info, I can pinpoint exactly what's wrong!
