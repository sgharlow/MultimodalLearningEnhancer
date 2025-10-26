/**
 * Automated Test Suite for Multimodal Learning Enhancer
 * Run in browser console on any page with extension loaded
 *
 * Usage:
 * 1. Open any webpage
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file into console
 * 4. Run: await runAllTests()
 */

const TestSuite = {
  passed: 0,
  failed: 0,
  results: [],

  /**
   * Log test result
   */
  log(testName, passed, message = '') {
    const result = {
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);

    if (passed) {
      this.passed++;
      console.log(`✅ PASS: ${testName}`, message || '');
    } else {
      this.failed++;
      console.error(`❌ FAIL: ${testName}`, message || '');
    }
  },

  /**
   * Assert helper
   */
  assert(condition, testName, errorMsg) {
    if (condition) {
      this.log(testName, true);
    } else {
      this.log(testName, false, errorMsg);
    }
    return condition;
  },

  /**
   * Print summary
   */
  summary() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.passed + this.failed}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (this.failed > 0) {
      console.log('\nFailed Tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  ❌ ${r.name}: ${r.message}`);
      });
    }

    return this.results;
  },

  /**
   * Export results as JSON
   */
  export() {
    const data = {
      summary: {
        total: this.passed + this.failed,
        passed: this.passed,
        failed: this.failed,
        successRate: ((this.passed / (this.passed + this.failed)) * 100).toFixed(1) + '%',
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📥 Test results exported to JSON');
  }
};

/**
 * Test 1: Global Objects Available
 */
async function testGlobalObjects() {
  console.log('\n📦 Testing Global Objects...');

  TestSuite.assert(
    typeof window.Utils !== 'undefined',
    'Utils object exists',
    'Utils not loaded'
  );

  TestSuite.assert(
    typeof window.ChromeAI !== 'undefined',
    'ChromeAI object exists',
    'ChromeAI not loaded'
  );

  TestSuite.assert(
    typeof window.ContentExtractor !== 'undefined',
    'ContentExtractor class exists',
    'ContentExtractor not loaded'
  );

  TestSuite.assert(
    typeof window.ContentAnalyzer !== 'undefined',
    'ContentAnalyzer class exists',
    'ContentAnalyzer not loaded'
  );

  TestSuite.assert(
    typeof window.TextTransformer !== 'undefined',
    'TextTransformer class exists',
    'TextTransformer not loaded'
  );

  TestSuite.assert(
    typeof window.DiagramGenerator !== 'undefined',
    'DiagramGenerator class exists',
    'DiagramGenerator not loaded'
  );

  TestSuite.assert(
    typeof window.VisualEngine !== 'undefined',
    'VisualEngine class exists',
    'VisualEngine not loaded'
  );

  TestSuite.assert(
    typeof window.Widget !== 'undefined',
    'Widget class exists',
    'Widget not loaded'
  );

  TestSuite.assert(
    typeof window.TextPrompts !== 'undefined',
    'TextPrompts object exists',
    'TextPrompts not loaded'
  );

  TestSuite.assert(
    typeof window.DiagramPrompts !== 'undefined',
    'DiagramPrompts object exists',
    'DiagramPrompts not loaded'
  );
}

/**
 * Test 2: Chrome AI API Availability
 */
async function testChromeAI() {
  console.log('\n🤖 Testing Chrome AI APIs...');

  const chromeAI = window.ChromeAI;
  const availability = await chromeAI.checkAvailability();

  TestSuite.assert(
    availability !== null,
    'Chrome AI availability check runs',
    'Availability check failed'
  );

  TestSuite.assert(
    typeof availability.promptAPI === 'boolean',
    'Prompt API status available',
    'Prompt API status not boolean'
  );

  TestSuite.assert(
    typeof availability.summarizerAPI === 'boolean',
    'Summarizer API status available',
    'Summarizer API status not boolean'
  );

  TestSuite.assert(
    typeof availability.writerAPI === 'boolean',
    'Writer API status available',
    'Writer API status not boolean'
  );

  TestSuite.assert(
    typeof availability.rewriterAPI === 'boolean',
    'Rewriter API status available',
    'Rewriter API status not boolean'
  );

  console.log('📊 API Availability:', availability);

  // Warning if APIs not available (not a failure)
  if (!availability.overall) {
    console.warn('⚠️  Chrome AI APIs not fully available. Some tests may fail.');
    console.warn('    Ensure you have Chrome Dev/Canary with APIs enabled.');
  }
}

/**
 * Test 3: Text Prompts Structure
 */
async function testTextPrompts() {
  console.log('\n📝 Testing Text Prompts...');

  const prompts = window.TextPrompts;

  TestSuite.assert(
    typeof prompts.studyNotes === 'object',
    'Study Notes prompts exist',
    'studyNotes missing'
  );

  TestSuite.assert(
    typeof prompts.studyNotes.template === 'function',
    'Study Notes template is function',
    'studyNotes.template not a function'
  );

  TestSuite.assert(
    typeof prompts.cornellNotes === 'object',
    'Cornell Notes prompts exist',
    'cornellNotes missing'
  );

  TestSuite.assert(
    typeof prompts.cornellNotes.template === 'function',
    'Cornell Notes template is function',
    'cornellNotes.template not a function'
  );

  TestSuite.assert(
    typeof prompts.cornellNotes.fallbackPrompt === 'function',
    'Cornell Notes fallback exists',
    'cornellNotes.fallbackPrompt missing'
  );

  TestSuite.assert(
    typeof prompts.formatCornellNotes === 'function',
    'Cornell Notes formatter exists',
    'formatCornellNotes missing'
  );

  TestSuite.assert(
    typeof prompts.bulletPoints === 'object',
    'Bullet Points prompts exist',
    'bulletPoints missing'
  );

  TestSuite.assert(
    typeof prompts.formatBulletPoints === 'function',
    'Bullet Points formatter exists',
    'formatBulletPoints missing'
  );

  // Test template generation
  try {
    const testContent = 'This is test content about artificial intelligence.';
    const testMetadata = { title: 'Test Article', wordCount: 100, readingTime: 5 };

    const cornellTemplate = prompts.cornellNotes.template(testContent, testMetadata);
    TestSuite.assert(
      cornellTemplate.includes('Cornell Notes'),
      'Cornell Notes template generates content',
      'Template output invalid'
    );

    TestSuite.assert(
      cornellTemplate.includes(testContent),
      'Cornell Notes template includes content',
      'Content not in template'
    );
  } catch (error) {
    TestSuite.log('Cornell Notes template generation', false, error.message);
  }
}

/**
 * Test 4: Diagram Prompts Structure
 */
async function testDiagramPrompts() {
  console.log('\n📊 Testing Diagram Prompts...');

  const prompts = window.DiagramPrompts;

  TestSuite.assert(
    typeof prompts.flowchart === 'object',
    'Flowchart prompts exist',
    'flowchart missing'
  );

  TestSuite.assert(
    typeof prompts.mindmap === 'object',
    'Mindmap prompts exist',
    'mindmap missing'
  );

  TestSuite.assert(
    typeof prompts.timeline === 'object',
    'Timeline prompts exist',
    'timeline missing'
  );

  TestSuite.assert(
    typeof prompts.flowchart.template === 'function',
    'Flowchart template is function',
    'flowchart.template not a function'
  );

  TestSuite.assert(
    typeof prompts.mindmap.template === 'function',
    'Mindmap template is function',
    'mindmap.template not a function'
  );

  TestSuite.assert(
    typeof prompts.timeline.template === 'function',
    'Timeline template is function',
    'timeline.template not a function'
  );
}

/**
 * Test 5: Content Extraction
 */
async function testContentExtraction() {
  console.log('\n📄 Testing Content Extraction...');

  try {
    const extractor = new ContentExtractor();

    TestSuite.assert(
      typeof extractor.extract === 'function',
      'ContentExtractor has extract method',
      'extract method missing'
    );

    // Test auto extraction
    const extraction = extractor.extract({ source: 'auto' });

    TestSuite.assert(
      extraction !== null,
      'Content extraction returns result',
      'Extraction returned null'
    );

    TestSuite.assert(
      typeof extraction.content === 'string',
      'Extracted content is string',
      'Content not a string'
    );

    TestSuite.assert(
      extraction.content.length > 0,
      'Extracted content not empty',
      'Content is empty'
    );

    TestSuite.assert(
      typeof extraction.title === 'string',
      'Extracted title exists',
      'Title missing'
    );

    TestSuite.assert(
      typeof extraction.url === 'string',
      'Extracted URL exists',
      'URL missing'
    );

    TestSuite.assert(
      typeof extraction.metadata === 'object',
      'Metadata exists',
      'Metadata missing'
    );

    TestSuite.assert(
      typeof extraction.metadata.wordCount === 'number',
      'Word count calculated',
      'Word count missing'
    );

    console.log(`📊 Extracted ${extraction.metadata.wordCount} words from page`);

  } catch (error) {
    TestSuite.log('Content extraction', false, error.message);
  }
}

/**
 * Test 6: Content Analysis
 */
async function testContentAnalysis() {
  console.log('\n🔍 Testing Content Analysis...');

  try {
    const extractor = new ContentExtractor();
    const analyzer = new ContentAnalyzer();

    const extraction = extractor.extract({ source: 'auto' });
    const analysis = analyzer.analyze(extraction);

    TestSuite.assert(
      analysis !== null,
      'Content analysis returns result',
      'Analysis returned null'
    );

    TestSuite.assert(
      typeof analysis.recommendedDiagram === 'string',
      'Recommended diagram type exists',
      'recommendedDiagram missing'
    );

    TestSuite.assert(
      ['flowchart', 'mindmap', 'timeline'].includes(analysis.recommendedDiagram),
      'Recommended diagram type is valid',
      `Invalid type: ${analysis.recommendedDiagram}`
    );

    TestSuite.assert(
      Array.isArray(analysis.keyTerms),
      'Key terms is array',
      'keyTerms not an array'
    );

    TestSuite.assert(
      typeof analysis.confidence === 'number',
      'Confidence score exists',
      'Confidence missing'
    );

    console.log(`📊 Analysis: ${analysis.recommendedDiagram} (confidence: ${analysis.confidence})`);

  } catch (error) {
    TestSuite.log('Content analysis', false, error.message);
  }
}

/**
 * Test 7: Widget Initialization
 */
async function testWidget() {
  console.log('\n🎨 Testing Widget...');

  try {
    const widget = new Widget();

    TestSuite.assert(
      typeof widget.init === 'function',
      'Widget has init method',
      'init method missing'
    );

    TestSuite.assert(
      typeof widget.show === 'function',
      'Widget has show method',
      'show method missing'
    );

    TestSuite.assert(
      typeof widget.hide === 'function',
      'Widget has hide method',
      'hide method missing'
    );

    TestSuite.assert(
      typeof widget.displayResults === 'function',
      'Widget has displayResults method',
      'displayResults method missing'
    );

    TestSuite.assert(
      typeof widget.buildCornellNotesContent === 'function',
      'Widget has buildCornellNotesContent method',
      'buildCornellNotesContent method missing'
    );

    // Check results object has Cornell Notes
    TestSuite.assert(
      widget.results.hasOwnProperty('cornell'),
      'Widget results has cornell property',
      'cornell property missing from results'
    );

  } catch (error) {
    TestSuite.log('Widget initialization', false, error.message);
  }
}

/**
 * Test 8: Utils Functions
 */
async function testUtils() {
  console.log('\n🔧 Testing Utility Functions...');

  const utils = window.Utils;

  TestSuite.assert(
    typeof utils.wordCount === 'function',
    'wordCount function exists',
    'wordCount missing'
  );

  TestSuite.assert(
    typeof utils.estimateReadingTime === 'function',
    'estimateReadingTime function exists',
    'estimateReadingTime missing'
  );

  TestSuite.assert(
    typeof utils.cleanText === 'function',
    'cleanText function exists',
    'cleanText missing'
  );

  // Test word count
  const testText = 'The quick brown fox jumps over the lazy dog.';
  const wordCount = utils.wordCount(testText);
  TestSuite.assert(
    wordCount === 9,
    'wordCount calculates correctly',
    `Expected 9, got ${wordCount}`
  );

  // Test reading time
  const readingTime = utils.estimateReadingTime(testText);
  TestSuite.assert(
    typeof readingTime === 'number',
    'estimateReadingTime returns number',
    `Got ${typeof readingTime}`
  );

  // Test text cleaning
  const dirtyText = '   Hello   World   ';
  const cleaned = utils.cleanText(dirtyText);
  TestSuite.assert(
    cleaned === 'Hello World',
    'cleanText removes extra whitespace',
    `Got: "${cleaned}"`
  );
}

/**
 * Test 9: TextTransformer Methods
 */
async function testTextTransformer() {
  console.log('\n📚 Testing TextTransformer...');

  const chromeAI = window.ChromeAI;
  const transformer = new TextTransformer(chromeAI);

  TestSuite.assert(
    typeof transformer.generateBulletPoints === 'function',
    'generateBulletPoints method exists',
    'generateBulletPoints missing'
  );

  TestSuite.assert(
    typeof transformer.generateStudyNotes === 'function',
    'generateStudyNotes method exists',
    'generateStudyNotes missing'
  );

  TestSuite.assert(
    typeof transformer.generateCornellNotes === 'function',
    'generateCornellNotes method exists',
    'generateCornellNotes missing'
  );

  TestSuite.assert(
    typeof transformer.generateCornellNotesFallback === 'function',
    'generateCornellNotesFallback method exists',
    'generateCornellNotesFallback missing'
  );

  TestSuite.assert(
    typeof transformer.analyzeCornellStructure === 'function',
    'analyzeCornellStructure method exists',
    'analyzeCornellStructure missing'
  );

  TestSuite.assert(
    typeof transformer.checkAPIsAvailable === 'function',
    'checkAPIsAvailable method exists',
    'checkAPIsAvailable missing'
  );

  // Test Cornell structure analysis
  const testCornellNotes = `
## 📋 Cornell Notes: Test

### 🔑 Cue Column | 📝 Notes

**What is AI?** | Artificial Intelligence is machine learning.
**Key term:** | Definition here.

---

### 📌 Summary
This is a summary.
  `;

  const structure = transformer.analyzeCornellStructure(testCornellNotes);
  TestSuite.assert(
    typeof structure.cuePairs === 'number',
    'analyzeCornellStructure returns cuePairs count',
    'cuePairs missing'
  );

  TestSuite.assert(
    structure.cuePairs === 2,
    'analyzeCornellStructure counts cue pairs correctly',
    `Expected 2 pairs, got ${structure.cuePairs}`
  );

  TestSuite.assert(
    structure.hasSummary === true,
    'analyzeCornellStructure detects summary',
    'Summary not detected'
  );
}

/**
 * Test 10: Visual Engine
 */
async function testVisualEngine() {
  console.log('\n🎨 Testing VisualEngine...');

  const engine = new VisualEngine();

  TestSuite.assert(
    typeof engine.initialize === 'function',
    'VisualEngine has initialize method',
    'initialize missing'
  );

  TestSuite.assert(
    typeof engine.renderDiagram === 'function',
    'VisualEngine has renderDiagram method',
    'renderDiagram missing'
  );

  console.log('⚠️  Note: Mermaid loading test requires manual verification');
  console.log('   Check console for: "[VisualEngine] Mermaid.js loaded from..."');
}

/**
 * Test 11: Console Error Check
 */
async function testConsoleErrors() {
  console.log('\n🔍 Checking for Console Errors...');

  // Note: This is informational - we can't retroactively check for errors
  // but we can warn the user to check
  console.log('⚠️  Manual check required: Look for red error messages above');
  console.log('   If you see errors (besides test failures), investigate them');

  TestSuite.log(
    'Console error check (manual)',
    true,
    'Check console manually for errors'
  );
}

/**
 * Run all automated tests
 */
async function runAllTests() {
  console.clear();
  console.log('🚀 Starting Automated Test Suite...');
  console.log('='.repeat(60));

  TestSuite.passed = 0;
  TestSuite.failed = 0;
  TestSuite.results = [];

  await testGlobalObjects();
  await testChromeAI();
  await testTextPrompts();
  await testDiagramPrompts();
  await testContentExtraction();
  await testContentAnalysis();
  await testWidget();
  await testUtils();
  await testTextTransformer();
  await testVisualEngine();
  await testConsoleErrors();

  const results = TestSuite.summary();

  console.log('\n💾 Export test results?');
  console.log('   Run: TestSuite.export()');

  return results;
}

// Make functions available globally
window.runAllTests = runAllTests;
window.TestSuite = TestSuite;

console.log('✅ Test suite loaded!');
console.log('📝 Run: await runAllTests()');
