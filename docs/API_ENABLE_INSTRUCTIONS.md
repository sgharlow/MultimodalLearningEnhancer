# How to Enable Chrome Built-in AI APIs

The Multimodal Learning Enhancer uses Chrome's experimental Built-in AI APIs. These APIs are currently in early preview and require specific setup.

## Prerequisites

You need **Chrome Dev** or **Chrome Canary** version **128 or later**.

### Download Chrome Dev/Canary

- **Chrome Dev**: https://www.google.com/chrome/dev/
- **Chrome Canary**: https://www.google.com/chrome/canary/

## Step-by-Step Setup

### 1. Check Your Chrome Version

1. Open Chrome Dev or Canary
2. Go to `chrome://version`
3. Verify version is **128** or higher

### 2. Enable Required Flags

Navigate to `chrome://flags` and enable the following:

#### **Prompt API (Required)**
- Flag: `chrome://flags/#prompt-api-for-gemini-nano`
- Set to: **Enabled**

#### **Summarization API (Required)**
- Flag: `chrome://flags/#summarization-api-for-gemini-nano`
- Set to: **Enabled**

#### **Writer API (Required)**
- Flag: `chrome://flags/#writer-api-for-gemini-nano`
- Set to: **Enabled**

#### **Rewriter API (Required)**
- Flag: `chrome://flags/#rewriter-api-for-gemini-nano`
- Set to: **Enabled**

#### **Optimization Guide (Required)**
- Flag: `chrome://flags/#optimization-guide-on-device-model`
- Set to: **Enabled BypassPerfRequirement**
  - This bypasses performance checks for testing

### 3. Download Gemini Nano Model

After enabling the flags:

1. **Restart Chrome** (important!)
2. Open **DevTools** (F12 or Ctrl+Shift+I)
3. Go to **Console** tab
4. Run this command:

```javascript
await ai.languageModel.create();
```

5. You should see a download progress indicator
6. Wait for the model to download (~1.7 GB)
7. Once complete, you'll see a success message

### 4. Verify Installation

Run these commands in the DevTools console:

```javascript
// Check Prompt API
(await ai.languageModel.capabilities()).available;
// Should return: "readily"

// Check Summarizer API
(await ai.summarizer.capabilities()).available;
// Should return: "readily"

// Check Writer API
(await ai.writer.capabilities()).available;
// Should return: "readily"

// Check Rewriter API
(await ai.rewriter.capabilities()).available;
// Should return: "readily"
```

If all return `"readily"`, you're all set!

## Troubleshooting

### APIs Return "no" or "after-download"

- **Solution**: Complete Step 3 above to download the model
- Restart Chrome after download completes

### Model Download Fails

- **Check your internet connection**
- **Ensure you have 2+ GB free disk space**
- **Try on a different network** (corporate networks may block)
- **Clear Chrome cache** and retry

### Flags Not Showing Up

- **Update Chrome** to the latest Dev/Canary version
- **Check version** is 128+ at `chrome://version`

### "API not available" Error

1. Verify all 5 flags are enabled
2. Restart Chrome completely (quit all Chrome processes)
3. Re-download the model using Step 3
4. Check DevTools console for specific error messages

## Platform-Specific Notes

### Windows
- APIs should work on Windows 10/11
- Minimum 4GB RAM recommended

### macOS
- Works on macOS 11+ (Big Sur or later)
- Apple Silicon (M1/M2) fully supported

### Linux
- Experimental support
- May require additional flags

### ChromeOS
- Full support on recent ChromeOS versions

## Additional Resources

- **Chrome AI API Documentation**: https://developer.chrome.com/docs/ai/built-in
- **Prompt API Guide**: https://developer.chrome.com/docs/ai/built-in-apis
- **API Origin Trial**: https://developer.chrome.com/origintrials/#/trials/active

## Quick Check Script

Paste this into DevTools console to check all APIs at once:

```javascript
(async () => {
  const apis = {
    'Prompt API': await ai.languageModel.capabilities(),
    'Summarizer API': await ai.summarizer.capabilities(),
    'Writer API': await ai.writer.capabilities(),
    'Rewriter API': await ai.rewriter.capabilities()
  };

  console.table(Object.entries(apis).map(([name, cap]) => ({
    API: name,
    Available: cap.available,
    Status: cap.available === 'readily' ? '✅ Ready' : '❌ Not Ready'
  })));
})();
```

You should see all green checkmarks!

---

**Need help?** Open an issue on our GitHub repository.
