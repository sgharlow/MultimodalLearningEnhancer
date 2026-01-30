/**
 * Demo Mode for Multimodal Learning Enhancer
 * Provides mock responses when Chrome AI APIs are unavailable
 * FOR TESTING AND DEMONSTRATION PURPOSES ONLY
 */

const DemoMode = {
  enabled: false, // Set to true to enable mock responses

  mockResponses: {
    flowchart: {
      'javascript functions': `flowchart TD
    A[JavaScript Functions] --> B[Function Declaration]
    A --> C[Function Expression]
    A --> D[Arrow Functions]
    B --> E[Named Functions]
    B --> F[Hoisted]
    C --> G[Anonymous Functions]
    C --> H[Not Hoisted]
    D --> I[Concise Syntax]
    D --> J[Lexical this]
    E --> K[function name() {}]
    G --> L[const fn = function() {}]
    I --> M[const fn = () => {}]`,

      'world war ii': `timeline
    title World War II Major Events
    1939-09-01 : Germany invades Poland : War begins
    1940-05-10 : Germany invades France
    1941-06-22 : Operation Barbarossa : Germany invades USSR
    1941-12-07 : Pearl Harbor : USA enters war
    1942-08-23 : Battle of Stalingrad begins
    1944-06-06 : D-Day : Allied invasion of Normandy
    1945-05-08 : V-E Day : Germany surrenders
    1945-08-06 : Atomic bomb on Hiroshima
    1945-09-02 : V-J Day : Japan surrenders`,

      'artificial intelligence': `mindmap
  root((Artificial Intelligence))
    Machine Learning
      Supervised Learning
        Classification
        Regression
      Unsupervised Learning
        Clustering
        Dimensionality Reduction
      Reinforcement Learning
    Natural Language Processing
      Text Analysis
      Machine Translation
      Sentiment Analysis
    Computer Vision
      Image Recognition
      Object Detection
      Facial Recognition
    Robotics
      Autonomous Systems
      Motion Planning
    Expert Systems
      Rule-Based Systems
      Knowledge Representation`
    },

    summary: {
      default: `• **Key Point 1:** The content discusses fundamental concepts and their practical applications
• **Key Point 2:** Multiple approaches and methodologies are presented with examples
• **Key Point 3:** Historical context and evolution of the subject matter is covered
• **Key Point 4:** Current state-of-the-art techniques and best practices are explained
• **Key Point 5:** Future directions and potential developments are outlined

**Reading Time:** 5 minutes
**Word Count:** ~500 words
**Compression:** 80%`
    },

    studyNotes: {
      default: `## 📚 Study Notes

### 🎯 Main Concepts

**Core Idea:**
The material covers essential principles and their real-world applications, providing both theoretical foundations and practical examples.

**Key Definitions:**
- **Term 1:** Fundamental concept that forms the basis of understanding
- **Term 2:** Advanced principle building on core concepts
- **Term 3:** Practical application or technique

### 📝 Important Details

**Section 1: Foundations**
- First major point with supporting details
- Second major point with context
- Third major point with examples

**Section 2: Applications**
- How concepts apply in practice
- Real-world scenarios and use cases
- Common patterns and approaches

### 💡 Key Takeaways

1. **Essential Understanding:** Core concept you must remember
2. **Practical Application:** How to use this knowledge
3. **Further Learning:** Areas to explore next

### 🔗 Connections

This topic relates to broader themes and connects with other areas of study. Understanding these relationships enhances comprehension.

**Study Tips:**
- Review key definitions regularly
- Practice with real examples
- Connect concepts to prior knowledge`
    },

    cornellNotes: {
      default: `## 📋 Cornell Notes: Study Topic

### 🔑 Cue Column | 📝 Notes

**What is the main concept?** | The central idea revolves around understanding core principles and their applications in various contexts. This provides a foundation for deeper learning.

**Key term definition?** | Important terminology that describes fundamental aspects of the subject matter, essential for communication and comprehension.

**How does it work?** | The process involves multiple steps: first understanding basics, then applying concepts, and finally synthesizing knowledge into practical skills.

**Why is this important?** | This knowledge forms the basis for advanced topics and real-world applications, making it crucial for continued learning and professional development.

**What are examples?** | Real-world scenarios include practical applications in various fields, demonstrating the versatility and importance of these concepts.

**Common mistakes?** | Beginners often confuse related concepts or skip fundamental steps, leading to gaps in understanding that become problematic later.

**Best practices?** | Expert recommendations include systematic study, regular practice, and connecting new knowledge to existing understanding.

---

### 📌 Summary

This topic covers essential concepts that form the foundation for understanding more advanced material. Key principles include systematic approaches, practical applications, and continuous learning. Mastery requires both theoretical knowledge and hands-on practice.`
    }
  },

  /**
   * Get mock diagram based on content
   */
  getMockDiagram(content) {
    const contentLower = content.toLowerCase();

    // Try to match content to predefined responses
    if (contentLower.includes('function') || contentLower.includes('javascript')) {
      return this.mockResponses.flowchart['javascript functions'];
    }
    if (contentLower.includes('war') || contentLower.includes('histor')) {
      return this.mockResponses.flowchart['world war ii'];
    }
    if (contentLower.includes('ai') || contentLower.includes('artificial intelligence') || contentLower.includes('machine learning')) {
      return this.mockResponses.flowchart['artificial intelligence'];
    }

    // Default flowchart
    return `flowchart TD
    A[Main Topic] --> B[Concept 1]
    A --> C[Concept 2]
    A --> D[Concept 3]
    B --> E[Detail 1.1]
    B --> F[Detail 1.2]
    C --> G[Detail 2.1]
    D --> H[Detail 3.1]`;
  },

  /**
   * Get mock summary
   */
  getMockSummary(content) {
    return this.mockResponses.summary.default;
  },

  /**
   * Get mock study notes
   */
  getMockStudyNotes(content) {
    return this.mockResponses.studyNotes.default;
  },

  /**
   * Get mock Cornell notes
   */
  getMockCornellNotes(content) {
    return this.mockResponses.cornellNotes.default;
  },

  /**
   * Check if demo mode is enabled
   */
  isEnabled() {
    return this.enabled;
  },

  /**
   * Enable/disable demo mode
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`[Demo Mode] ${enabled ? 'ENABLED' : 'DISABLED'} - Using ${enabled ? 'mock' : 'real'} AI responses`);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.DemoMode = DemoMode;
}

console.log('[Demo Mode] Loaded - Ready for testing without Chrome AI APIs');
