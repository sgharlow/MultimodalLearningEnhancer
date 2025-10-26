# 🧪 Testing Suite

Automated and manual testing resources for Multimodal Learning Enhancer.

---

## Quick Start

**Want to test everything quickly?** Follow this order:

1. **Read:** [QUICK_TEST_CHECKLIST.md](QUICK_TEST_CHECKLIST.md) - 5-minute rapid validation
2. **Run:** [automated-tests.js](automated-tests.js) - Automated test suite
3. **Do:** [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md) - Comprehensive manual tests
4. **Capture:** [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) - Professional screenshots

**Total time:** 60-90 minutes for complete testing

---

## Files in This Directory

### 📄 automated-tests.js
**Purpose:** JavaScript test suite that runs in browser console
**Tests:** 40+ automated checks for:
- Global object loading
- Chrome AI API availability
- Prompt template structure
- Content extraction/analysis
- Widget functionality
- Cornell Notes implementation

**How to use:**
```javascript
// 1. Open any webpage
// 2. Open DevTools Console (F12)
// 3. Copy-paste automated-tests.js
// 4. Run:
await runAllTests()

// Export results:
TestSuite.export()
```

**Time:** 5 minutes

---

### 📋 MANUAL_TESTING_GUIDE.md
**Purpose:** Step-by-step manual testing guide
**Tests:** 35+ manual tests covering:
- All transformation types
- Path A features (Cornell Notes, offline mode, error messages)
- Edge cases and stress testing
- History and storage
- Demo scenario rehearsal

**Sections:**
1. Setup verification (5 min)
2. Core transformations (30 min)
3. Path A features (20 min)
4. History & storage (10 min)
5. Edge cases (15 min)
6. Screenshot capture (10 min)
7. Demo rehearsal (10 min)

**Time:** 90 minutes (comprehensive)

---

### ⚡ QUICK_TEST_CHECKLIST.md
**Purpose:** Rapid validation checklist
**Tests:** Essential tests only
- 5-minute quick test
- 15-minute comprehensive test
- Pre-demo checklist
- Emergency debugging

**Use when:**
- Quick validation after changes
- Pre-demo smoke test
- Time-constrained testing

**Time:** 5-15 minutes

---

### 📸 SCREENSHOT_GUIDE.md
**Purpose:** Professional screenshot capture instructions
**Covers:**
- 6+ screenshot scenarios
- Framing and composition tips
- Tools and techniques
- Quality checklist
- README/DevPost integration

**Screenshots to capture:**
1. Visual diagram (flowchart)
2. **Cornell Notes** (NEW - highlight this!)
3. Study notes
4. Summary bullets
5. All tabs view
6. Extension popup
7. History (bonus)

**Time:** 10-15 minutes

---

## Testing Strategy

### Phase 1: Automated (5 min)
Run `automated-tests.js` to catch:
- Missing dependencies
- Broken object references
- API availability issues
- Structural problems

**Goal:** Find obvious bugs fast

---

### Phase 2: Core Functionality (30 min)
Test each transformation type:
- ✅ Visual diagrams (flowchart, mindmap, timeline)
- ✅ Bullet point summaries
- ✅ Study notes
- ✅ **Cornell Notes** (Path A feature)

**Goal:** Verify main features work

---

### Phase 3: Path A Features (20 min)
Test new enhancements:
- ✅ Cornell Notes format and quality
- ✅ Offline Mermaid.js support
- ✅ Improved error messages

**Goal:** Validate Path A additions

---

### Phase 4: Edge Cases (15 min)
Test unusual scenarios:
- Very short/long content
- Rapid transformations
- Extension reload
- Navigation behavior

**Goal:** Find edge case bugs

---

### Phase 5: Documentation (10 min)
Capture screenshots for:
- README visual examples
- DevPost submission
- Demo video preparation

**Goal:** Visual proof of quality

---

## Test Coverage

### What's Automated ✅
- Global object loading (10 tests)
- Chrome AI API checks (5 tests)
- Prompt template validation (8 tests)
- Content extraction (7 tests)
- Widget methods (5 tests)
- Utils functions (5 tests)
- Cornell Notes structure (3 tests)

**Total:** 40+ automated tests

### What's Manual ✋
- Visual quality assessment
- AI output quality
- User interaction flows
- Performance timing
- Screenshot capture
- Demo rehearsal

**Total:** 35+ manual tests

### Combined Coverage
**Automated + Manual = 75+ tests**

---

## Success Criteria

### Minimum (Demo Ready)
- ✅ Automated: 95%+ pass rate
- ✅ Manual: All core transformations work
- ✅ Cornell Notes displays correctly
- ✅ No console errors
- ✅ Demo scenarios tested

### Ideal (Submission Ready)
- ✅ Automated: 100% pass rate
- ✅ Manual: All tests pass
- ✅ 6+ screenshots captured
- ✅ Documentation verified
- ✅ Edge cases handled
- ✅ Demo rehearsed 2-3 times

---

## Common Issues & Solutions

### Issue: Automated tests fail
**Solution:** Check console for details, verify:
- Extension loaded at chrome://extensions
- All scripts loaded (check Network tab)
- Chrome AI APIs available

### Issue: Transformations timeout
**Solution:**
- Check internet connection (for diagrams)
- Verify Gemini Nano downloaded
- Try shorter content
- Check console for errors

### Issue: Cornell Notes not showing
**Solution:**
- Verify tab exists in widget
- Check `buildCornellNotesContent` exists
- Look for errors in console
- Try regenerating

### Issue: Screenshots look bad
**Solution:**
- Set zoom to 100%
- Maximize window
- Close unnecessary tabs
- Use clean test pages (Wikipedia, MDN)

---

## Time Estimates

| Activity | Quick | Thorough |
|----------|-------|----------|
| Automated tests | 5 min | 5 min |
| Manual core tests | 10 min | 30 min |
| Path A tests | 5 min | 20 min |
| Edge cases | - | 15 min |
| Screenshots | 5 min | 15 min |
| Demo rehearsal | - | 10 min |
| **TOTAL** | **25 min** | **95 min** |

**Recommended:** Thorough testing (90 min) before submission

---

## Workflow

### First Time Testing
1. Read MANUAL_TESTING_GUIDE.md (understand process)
2. Run automated-tests.js (catch obvious issues)
3. Follow manual guide section by section
4. Document issues as you find them
5. Fix critical bugs
6. Re-test after fixes
7. Capture screenshots
8. Rehearse demo

### Quick Re-Test (after fixes)
1. Run QUICK_TEST_CHECKLIST.md (5-15 min)
2. Verify fixes didn't break anything
3. Test specific areas changed

### Pre-Demo
1. Run 5-minute quick test
2. Test all demo scenarios
3. Verify screenshots ready
4. Check backup plan (offline mode)

---

## Reporting Issues

### For Critical Bugs
Document in MANUAL_TESTING_GUIDE.md:
- Test name and number
- Expected behavior
- Actual behavior
- Steps to reproduce
- Console errors (if any)
- Priority: Critical/High/Medium/Low

### For Non-Critical Issues
Note in guide for future improvement:
- Description
- Impact level
- Suggested fix

---

## What to Do With Results

### All Tests Pass ✅
1. Export automated test results
2. Capture all screenshots
3. Update README with stats
4. Proceed to demo video creation
5. Celebrate! 🎉

### Some Tests Fail ⚠️
1. Prioritize critical issues
2. Fix blockers first
3. Document non-critical issues
4. Re-test after fixes
5. Decide if ready for demo

### Major Issues Found ❌
1. Stop and fix critical bugs
2. Don't proceed to demo until stable
3. Re-run full test suite after fixes
4. Better to delay than demo broken code

---

## Integration with Submission

### For README
- Add test coverage stats
- Include screenshot examples
- Link to test results
- Show professionalism

### For DevPost
- Mention thorough testing
- Include screenshots showing features
- Highlight Path A enhancements
- Demonstrate quality

### For Demo Video
- Use rehearsed scenarios
- Know timing for each transformation
- Have backup plan ready
- Show best examples

---

## Best Practices

### Before Testing
- ✅ Fresh Chrome restart
- ✅ Extension reloaded
- ✅ DevTools open for monitoring
- ✅ Stable internet connection
- ✅ Test pages bookmarked

### During Testing
- ✅ Follow guide systematically
- ✅ Document issues immediately
- ✅ Take notes on timing
- ✅ Monitor console continuously
- ✅ Don't skip steps

### After Testing
- ✅ Export results
- ✅ Save screenshots
- ✅ Update documentation
- ✅ Fix critical bugs
- ✅ Re-test after changes

---

## Support Resources

- **Setup Issues:** See [docs/API_ENABLE_INSTRUCTIONS.md](../docs/API_ENABLE_INSTRUCTIONS.md)
- **Common Problems:** See [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
- **Path A Details:** See [docs/PATH_A_COMPLETE.md](../docs/PATH_A_COMPLETE.md)
- **Full Test Plan:** See [docs/PATH_A_TESTING.md](../docs/PATH_A_TESTING.md)

---

## Questions?

**Q: Do I need to run all tests?**
A: For submission, yes. For quick validation, use QUICK_TEST_CHECKLIST.md.

**Q: What if tests fail?**
A: Document issues, prioritize, fix critical bugs, then re-test.

**Q: How long does testing take?**
A: 25 min (quick) to 95 min (thorough). Budget 90 min for first time.

**Q: Can I automate manual tests?**
A: Some, but human judgment needed for quality/UX assessment.

**Q: What's most important?**
A: All 4 transformation types working + Cornell Notes + no errors.

---

**Ready to test?** Start with [QUICK_TEST_CHECKLIST.md](QUICK_TEST_CHECKLIST.md)!
