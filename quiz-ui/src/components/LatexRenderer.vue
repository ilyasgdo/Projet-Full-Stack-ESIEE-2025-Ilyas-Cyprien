<template>
  <span v-html="renderedContent"></span>
</template>

<script setup>
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  content: {
    type: String,
    required: true,
    default: ''
  }
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  
  let text = props.content
  let result = ''
  
  // First, handle block math ($$...$$)
  const blockRegex = /\$\$([^$]+)\$\$/g
  const blockMatches = []
  let match
  
  while ((match = blockRegex.exec(text)) !== null) {
    blockMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1]
    })
  }
  
  // Then handle inline math ($...$), but skip if it's part of block math
  const inlineRegex = /\$([^$\n]+)\$/g
  const inlineMatches = []
  
  while ((match = inlineRegex.exec(text)) !== null) {
    // Check if this match is inside a block math
    const isInBlock = blockMatches.some(block => 
      match.index >= block.start && match.index < block.end
    )
    if (!isInBlock) {
      inlineMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      })
    }
  }
  
  // Combine and sort all matches
  const allMatches = [...blockMatches, ...inlineMatches].sort((a, b) => a.start - b.start)
  
  // Build the result
  let currentIndex = 0
  
  for (const mathMatch of allMatches) {
    // Add text before the match
    if (mathMatch.start > currentIndex) {
      result += escapeHtml(text.substring(currentIndex, mathMatch.start))
    }
    
    // Render the LaTeX
    try {
      const isBlock = blockMatches.includes(mathMatch)
      const rendered = katex.renderToString(mathMatch.content, {
        throwOnError: false,
        displayMode: isBlock,
        output: 'html'
      })
      result += rendered
    } catch (error) {
      // Fallback: show the original LaTeX code if rendering fails
      const delimiter = blockMatches.includes(mathMatch) ? '$$' : '$'
      result += escapeHtml(delimiter + mathMatch.content + delimiter)
    }
    
    currentIndex = mathMatch.end
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    result += escapeHtml(text.substring(currentIndex))
  }
  
  return result || escapeHtml(text)
})

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
</script>

<style scoped>
:deep(.katex) {
  font-size: 1.1em;
}

:deep(.katex-display) {
  margin: 1em 0;
  text-align: center;
}
</style>

