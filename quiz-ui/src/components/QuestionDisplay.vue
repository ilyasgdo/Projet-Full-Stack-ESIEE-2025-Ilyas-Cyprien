<template>
  <Card class="mb-6">
    <CardContent class="p-6">
      <h2 class="text-xl font-semibold mb-6">{{ currentQuestion.title }}</h2>
      
      <img 
        v-if="currentQuestion.image" 
        :src="currentQuestion.image"
        :alt="currentQuestion.title"
        loading="lazy"
        class="w-full max-w-md mx-auto mb-6 rounded-lg shadow-md"
        @error="handleImageError"
      />
      
      <p v-if="currentQuestion.text" class="text-lg mb-6">
        {{ currentQuestion.text }}
      </p>
      
      <div class="space-y-3">
        <Button
          v-for="(answer, idx) in currentQuestion.possibleAnswers"
          :key="answer.id"
          @click="handleAnswerClick(idx + 1)"
          variant="ghost"
          :class="[
            'w-full p-4 text-left rounded-lg border transition-all duration-200 h-auto justify-start',
            selectedAnswer === (idx + 1)
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/50 hover:bg-accent'
          ]"
        >
          <div class="flex items-center">
            <div 
              :class="[
                'w-4 h-4 rounded-full border-2 mr-3 transition-all',
                selectedAnswer === (idx + 1)
                  ? 'border-primary bg-primary'
                  : 'border-border'
              ]"
            ></div>
            {{ answer.text }}
          </div>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Props
const props = defineProps({
  currentQuestion: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['click-on-answer'])

// Local state
const selectedAnswer = ref(null)

// Reset selected answer when question changes
watch(() => props.currentQuestion, () => {
  selectedAnswer.value = null
})

// Handle answer click
const handleAnswerClick = (answerIndex) => {
  selectedAnswer.value = answerIndex
  emit('click-on-answer', answerIndex)
}

// Handle image loading errors
const handleImageError = (event) => {
  console.warn('Failed to load question image:', event.target.src)
  // Hide the image element on error
  event.target.style.display = 'none'
}
</script>