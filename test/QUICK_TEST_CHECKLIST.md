# ⚡ Quick Test Checklist

**Use this for rapid validation before demo**

---

## 5-Minute Quick Test

### Setup (30 sec)
- [ ] Open Chrome Dev/Canary
- [ ] Extension loaded
- [ ] Navigate to: https://en.wikipedia.org/wiki/Artificial_intelligence

### Automated (1 min)
- [ ] F12 → Console
- [ ] Paste `test/automated-tests.js`
- [ ] Run: `await runAllTests()`
- [ ] Verify: 40+ tests passed

### Manual - All Transformations (3 min)
- [ ] Right-click → 📊 Generate Diagram → ✅ Works
- [ ] Right-click → 📝 Create Summary → ✅ Works
- [ ] Right-click → 🎯 Create Study Notes → ✅ Works
- [ ] Right-click → 📔 Create Cornell Notes → ✅ Works

### Visual Check (30 sec)
- [ ] Widget appears
- [ ] All 4 tabs visible
- [ ] Content looks good
- [ ] No errors in console

**Status:** [ ] ✅ PASS - Ready for demo

---

## 15-Minute Comprehensive Test

### Automated (2 min)
- [ ] Run full test suite
- [ ] Export results: `TestSuite.export()`

### Core Features (8 min)
- [ ] Test 2.1: Flowchart - Functions page → ✅
- [ ] Test 2.2: Summary - Photosynthesis → ✅
- [ ] Test 2.3: Study Notes - WWII → ✅
- [ ] Test 2.4: Cornell Notes - Climate change → ✅

### Path A Features (3 min)
- [ ] Cornell Notes tab exists → ✅
- [ ] Cornell Notes format correct → ✅
- [ ] Error messages are helpful → ✅

### Edge Cases (2 min)
- [ ] Long content works → ✅
- [ ] Short content handled → ✅
- [ ] Extension reload works → ✅

**Status:** [ ] ✅ PASS - Submission ready

---

## Pre-Demo Checklist (5 min before presenting)

### Environment
- [ ] Chrome Dev/Canary running
- [ ] Extension enabled
- [ ] DevTools closed (cleaner demo)
- [ ] Internet connection stable
- [ ] Test pages bookmarked

### Quick Smoke Test (one of each)
- [ ] Generate diagram on MDN page → ✅
- [ ] Generate Cornell Notes on Wikipedia → ✅

### Demo Pages Ready
- [ ] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
- [ ] https://en.wikipedia.org/wiki/World_War_II
- [ ] https://en.wikipedia.org/wiki/Photosynthesis

### Backup Plan
- [ ] Know how to showcase offline mode if internet fails
- [ ] Have screenshots ready as backup

**Status:** [ ] ✅ READY TO PRESENT

---

## Post-Testing Actions

### If ALL TESTS PASS:
1. [ ] Export automated test results
2. [ ] Capture 6 screenshots
3. [ ] Update README with final stats
4. [ ] Proceed to demo video creation

### If FAILURES FOUND:
1. [ ] Document issues in test guide
2. [ ] Prioritize critical bugs
3. [ ] Fix blocking issues first
4. [ ] Re-test after fixes
5. [ ] Only proceed when stable

---

## Emergency Debugging

**If transformation fails:**
```javascript
// Check API status
await ChromeAI.checkAvailability()

// Check if model available
await ai.languageModel.capabilities()
```

**If widget doesn't appear:**
- F12 → Check for errors
- Look for `[MLE]` or `[Widget]` messages
- Try refreshing page

**If Cornell Notes missing:**
- Check widget.js loaded
- Look for "📔 Cornell Notes" tab
- Verify `buildCornellNotesContent` exists

---

## Success Criteria

### Minimum for Demo:
- ✅ Automated tests: 95%+ pass rate
- ✅ All 4 transformation types work
- ✅ Cornell Notes displays correctly
- ✅ No console errors
- ✅ Demo scenarios tested

### Ideal for Submission:
- ✅ Automated tests: 100% pass rate
- ✅ All manual tests pass
- ✅ 6 screenshots captured
- ✅ Documentation verified
- ✅ Demo rehearsed

---

**Current Status:** [ ] Not started / [ ] In progress / [ ] Complete

**Ready for demo:** [ ] YES / [ ] NO

**Last tested:** _____________________
