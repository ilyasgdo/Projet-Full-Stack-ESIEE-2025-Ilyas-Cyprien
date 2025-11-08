<template>
  <Card class="mb-6 glass-card ring-gradient tilt-hover">
    <CardContent class="p-6">
      <h2 class="text-xl font-semibold mb-6 text-gradient with-gradient-underline">{{ currentQuestion.title }}</h2>
      
      <img 
        v-if="validImageSrc && !imageHasError" 
        :src="currentQuestion.image"
        :alt="currentQuestion.title"
        loading="lazy"
        decoding="async"
        class="w-full max-w-md mx-auto mb-6 rounded-lg shadow-md"
        @error="handleImageError"
      />
      
      <div v-if="currentQuestion.text" class="text-lg mb-6">
        <LatexRenderer :content="currentQuestion.text" />
      </div>
      
      <div class="space-y-3" role="radiogroup" :aria-label="'Choisissez une réponse pour ' + currentQuestion.title">
        <Button
          v-for="(answer, idx) in currentQuestion.possibleAnswers"
          :key="answer.id"
          :ref="el => (answerButtons[idx] = el)"
          @click="handleAnswerClick(idx + 1)"
          @focus="focusedIndex = idx"
          @keydown.enter.prevent="requestNext()"
          @keydown.space.prevent="selectFocused()"
          @keydown.tab="handleTab(idx, $event)"
          @keydown.shift.tab="handleShiftTab(idx, $event)"
          variant="ghost"
          :class="[
            'w-full p-4 text-left rounded-lg border transition-all duration-200 h-auto justify-start hover-float hover-glow ambient-shine',
            selectedAnswer === (idx + 1)
              ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(59,130,246,0.45)]'
              : 'border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
          ]"
          role="radio"
          :aria-checked="selectedAnswer === (idx + 1) ? 'true' : 'false'"
          :tabindex="focusedIndex === idx ? 0 : -1"
        >
          <div class="flex items-center">
            <div 
              :class="[
                'w-4 h-4 rounded-full border-2 mr-3 transition-all',
                selectedAnswer === (idx + 1)
                  ? 'border-primary bg-primary shadow-[0_0_12px_rgba(59,130,246,0.45)] ring-2 ring-primary/40'
                  : 'border-border'
              ]"
              aria-hidden="true"
            ></div>
            <LatexRenderer :content="answer.text" />
          </div>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
    
    <script setup>
    import { ref, watch, computed, nextTick } from 'vue'
    import { Button } from '@/components/ui/button'
    import { Card, CardContent } from '@/components/ui/card'
    import LatexRenderer from '@/components/LatexRenderer.vue'
    
    // Props
    const props = defineProps({
      currentQuestion: {
        type: Object,
        required: true
      }
    })
    
    // Emits
    const emit = defineEmits(['click-on-answer', 'request-next'])
    
    // Local state
    const selectedAnswer = ref(null)
    const focusedIndex = ref(0)
    const answerButtons = ref([])
    const imageHasError = ref(false)
    
    // Helpers
    const isValidImageSource = (src) => {
      if (!src || typeof src !== 'string') return false
      const s = src.trim()
      if (!s) return false
      if (s.startsWith('data:image/')) return true
      if (/^https?:\/\//.test(s)) return true
      return false
    }
    
    const validImageSrc = computed(() => isValidImageSource(props.currentQuestion?.image))
    
    // Reset selected answer when question changes
    watch(() => props.currentQuestion, async () => {
      selectedAnswer.value = null
      imageHasError.value = false
      focusedIndex.value = 0
      await nextTick()
      const el = answerButtons.value[focusedIndex.value]
      ;(el?.$el ?? el)?.focus?.()
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
      imageHasError.value = true
    }
    
    // Keyboard navigation helpers
    const focusNext = () => {
      const total = props.currentQuestion?.possibleAnswers?.length || 0
      if (!total) return
      focusedIndex.value = (focusedIndex.value + 1) % total
      const el = answerButtons.value[focusedIndex.value]
      ;(el?.$el ?? el)?.focus?.()
    }
    
    const focusPrev = () => {
      const total = props.currentQuestion?.possibleAnswers?.length || 0
      if (!total) return
      focusedIndex.value = (focusedIndex.value - 1 + total) % total
      const el = answerButtons.value[focusedIndex.value]
      ;(el?.$el ?? el)?.focus?.()
    }
    
    const selectFocused = () => {
      handleAnswerClick(focusedIndex.value + 1)
    }
    
    const requestNext = () => {
      emit('request-next')
    }
    
    const handleTab = (idx, e) => {
      const total = props.currentQuestion?.possibleAnswers?.length || 0
      if (idx < total - 1) {
        e.preventDefault()
        focusedIndex.value = idx + 1
        const el = answerButtons.value[focusedIndex.value]
        ;(el?.$el ?? el)?.focus?.()
      }
      // sinon on laisse Tab sortir du radiogroupe vers l'élément suivant
    }
    
    const handleShiftTab = (idx, e) => {
      if (idx > 0) {
        e.preventDefault()
        focusedIndex.value = idx - 1
        const el = answerButtons.value[focusedIndex.value]
        ;(el?.$el ?? el)?.focus?.()
      }
      // sinon on laisse Shift+Tab revenir à l'élément précédent hors du groupe
    }
    </script>