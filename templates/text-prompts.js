/**
 * Prompt Templates for Text Transformations
 * Optimized for educational content processing
 */

const TextPrompts = {
  /**
   * Generate bullet point summary
   * Used with Summarizer API for quick key points
   */
  bulletPoints: {
    systemPrompt: 'You are an expert at extracting key points from educational content. Create concise, informative bullet points.',

    formatInstructions: `
Create a bullet-point summary with these guidelines:
- Extract 5-10 most important key points
- Each point should be concise but complete
- Start each point with an action verb or key concept
- Focus on main ideas, not minor details
- Use clear, simple language
- Order points logically (most important first)
    `.trim()
  },

  /**
   * Generate structured study notes
   * Used with Writer API for comprehensive notes
   */
  studyNotes: {
    systemPrompt: 'You are an expert educator creating structured study materials. Your notes help students learn and retain information effectively.',

    template: (content, metadata) => `
Create comprehensive study notes from the following content.

CONTENT TITLE: ${metadata.title || 'Study Material'}
CONTENT LENGTH: ${metadata.wordCount || 'N/A'} words
READING TIME: ${metadata.readingTime || 'N/A'} minutes

FORMAT YOUR NOTES AS FOLLOWS:

## 📚 Overview
[2-3 sentences summarizing the main topic and why it's important]

## 🎯 Key Concepts
[List and briefly explain 5-8 main concepts with clear definitions]

## 💡 Important Details
[Highlight critical facts, examples, or principles students should remember]

## 📝 Examples & Applications
[Provide concrete examples or real-world applications if present in the content]

## ⚠️ Common Misconceptions
[Note any common misunderstandings or clarifications needed]

## 🔗 Connections
[How this topic relates to other concepts or builds on previous knowledge]

CONTENT TO TRANSFORM:
${content}

Create notes that are clear, well-organized, and optimized for learning and retention.
    `.trim(),

    fallbackPrompt: (content) => `
Create structured study notes from this content. Include:
1. Overview (2-3 sentences)
2. Key Concepts (5-8 main ideas with definitions)
3. Important Details (critical facts and examples)
4. Connections (how concepts relate)

Content:
${content}
    `.trim()
  },

  /**
   * Generate summary for different lengths
   */
  summary: {
    brief: {
      systemPrompt: 'You are an expert at creating ultra-concise summaries. Capture the essence in minimal words.',
      type: 'tl;dr',
      length: 'short'
    },

    standard: {
      systemPrompt: 'You are an expert at creating balanced summaries. Capture key information clearly and concisely.',
      type: 'key-points',
      length: 'medium'
    },

    comprehensive: {
      systemPrompt: 'You are an expert at creating detailed summaries. Capture all important information while maintaining clarity.',
      type: 'key-points',
      length: 'long'
    }
  },

  /**
   * Format bullet points for display
   */
  formatBulletPoints: (summary) => {
    // Ensure bullet points are properly formatted
    let formatted = summary;

    // If not already bulleted, add bullets
    if (!summary.includes('•') && !summary.includes('-') && !summary.includes('*')) {
      const lines = summary.split('\n').filter(line => line.trim());
      formatted = lines.map(line => `• ${line.trim()}`).join('\n');
    }

    return formatted;
  },

  /**
   * Clean and format study notes
   */
  formatStudyNotes: (notes) => {
    // Ensure proper markdown formatting
    let formatted = notes;

    // Add spacing after headers
    formatted = formatted.replace(/^(#{1,3}.*?)$/gm, '\n$1\n');

    // Clean up excessive newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  },

  /**
   * Generate comprehension questions
   */
  comprehensionQuestions: {
    template: (summary, level = 'intermediate') => `
Based on this summary, create 3-5 comprehension questions at ${level} level.

Summary:
${summary}

Questions should:
- Test understanding, not just recall
- Be clear and specific
- Have definite answers based on the content
- Progress from basic to more complex

Format as:
Q1: [Question]
Q2: [Question]
etc.
    `.trim()
  },

  /**
   * Adapt content to different levels
   */
  adaptToLevel: {
    eli5: {
      systemPrompt: 'You are an expert at explaining complex topics in simple terms that a 5-year-old could understand.',
      tone: 'casual',
      format: 'simple'
    },

    undergraduate: {
      systemPrompt: 'You are a university professor explaining concepts to undergraduate students.',
      tone: 'professional',
      format: 'academic'
    },

    graduate: {
      systemPrompt: 'You are an expert researcher explaining advanced concepts to graduate students.',
      tone: 'professional',
      format: 'technical'
    },

    expert: {
      systemPrompt: 'You are communicating with fellow experts. Use precise technical terminology.',
      tone: 'professional',
      format: 'technical'
    }
  },

  /**
   * Extract key terms and definitions
   */
  keyTerms: {
    template: (content) => `
Extract the most important terms and their definitions from this content.

Content:
${content}

Format as:
**Term**: Definition
**Term**: Definition
etc.

Extract 5-10 most important terms.
    `.trim()
  },

  /**
   * Create outline from content
   */
  outline: {
    template: (content) => `
Create a hierarchical outline from this content.

Content:
${content}

Format as:
I. Main Topic
   A. Subtopic
      1. Detail
      2. Detail
   B. Subtopic
II. Main Topic
etc.

Use clear, concise headings.
    `.trim()
  },

  /**
   * Generate Cornell Notes format
   * Popular note-taking system for students
   */
  cornellNotes: {
    systemPrompt: 'You are an expert educator specializing in the Cornell Note-taking system. Create notes that help students learn effectively.',

    template: (content, metadata) => `
Create Cornell Notes from the following content.

CONTENT TITLE: ${metadata.title || 'Study Material'}

Cornell Notes have three sections:
1. CUE COLUMN (left, 30%): Questions and key terms that cue the notes
2. NOTE-TAKING AREA (right, 70%): Main notes, details, examples
3. SUMMARY (bottom): Brief 2-3 sentence overview

FORMAT YOUR CORNELL NOTES EXACTLY AS FOLLOWS:

## 📋 Cornell Notes: ${metadata.title || 'Study Material'}

### 🔑 Cue Column | 📝 Notes

**What is [main topic]?** | The main concept is [explanation with details and examples]

**Key term:** | Definition and explanation

**How does [process] work?** | Step-by-step explanation of the process

**Why is [concept] important?** | Significance and applications

[Continue with 5-10 cue/note pairs covering all major points]

---

### 📌 Summary
[Write a concise 2-3 sentence summary that captures the essential points of the entire topic. This should be detailed enough to review the main ideas without reading all notes.]

---

CONTENT TO TRANSFORM:
${content}

IMPORTANT GUIDELINES:
- Cues should be questions or key terms that prompt recall
- Notes should be clear, concise explanations with examples
- Use markdown table format with | separator
- Include 5-10 cue/note pairs minimum
- Summary must be comprehensive yet brief
- Focus on understanding, not just facts
    `.trim(),

    fallbackPrompt: (content) => `
Create Cornell Notes from this content.

Use this format:
**Cue (Question/Term)** | **Notes (Answer/Definition)**

Then end with:
**Summary:** [2-3 sentence overview]

Content:
${content}
    `.trim()
  },

  /**
   * Format Cornell Notes for display
   */
  formatCornellNotes: (notes) => {
    // Ensure proper formatting
    let formatted = notes;

    // Add spacing around sections
    formatted = formatted.replace(/^(#{2,3}.*?)$/gm, '\n$1\n');

    // Ensure summary section is emphasized
    formatted = formatted.replace(/### 📌 Summary/g, '\n---\n\n### 📌 Summary');

    // Clean up excessive newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.TextPrompts = TextPrompts;
}

// Also export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextPrompts;
}
