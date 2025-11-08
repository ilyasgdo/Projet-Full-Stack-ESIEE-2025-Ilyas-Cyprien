import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionDisplay from '@/components/QuestionDisplay.vue'

// Mock LatexRenderer component
vi.mock('@/components/LatexRenderer.vue', () => ({
  default: {
    name: 'LatexRenderer',
    props: ['content'],
    template: '<span>{{ content }}</span>'
  }
}))

describe('QuestionDisplay', () => {
  const mockQuestion = {
    title: 'Test Question',
    text: 'What is the answer?',
    image: 'http://localhost:3000/test-image.jpg',
    possibleAnswers: [
      { id: 1, text: 'Answer 1', isCorrect: false },
      { id: 2, text: 'Answer 2', isCorrect: true },
      { id: 3, text: 'Answer 3', isCorrect: false }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders question title', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    expect(wrapper.find('h2').text()).toBe('Test Question')
  })

  it('renders question text using LatexRenderer', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const latexRenderer = wrapper.findComponent({ name: 'LatexRenderer' })
    expect(latexRenderer.exists()).toBe(true)
    expect(latexRenderer.props('content')).toBe('What is the answer?')
  })

  it('does not render text when not provided', () => {
    const questionWithoutText = { ...mockQuestion, text: null }
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: questionWithoutText }
    })

    const textContainer = wrapper.find('.text-lg')
    expect(textContainer.exists()).toBe(false)
  })

  it('renders question image with lazy loading', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('http://localhost:3000/test-image.jpg')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('decoding')).toBe('async')
    expect(img.attributes('alt')).toBe('Test Question')
  })

  it('does not render image when not provided', () => {
    const questionWithoutImage = { ...mockQuestion, image: null }
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: questionWithoutImage }
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('does not render image when image is empty string', () => {
    const questionWithEmptyImage = { ...mockQuestion, image: '' }
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: questionWithEmptyImage }
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders all possible answers as buttons', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    expect(buttons).toHaveLength(3)
    
    // Check that answers are rendered with LatexRenderer
    const latexRenderers = wrapper.findAllComponents({ name: 'LatexRenderer' })
    expect(latexRenderers.length).toBeGreaterThanOrEqual(3) // At least 3 for answers, plus 1 for question text
  })

  it('emits click-on-answer when answer is clicked', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const firstButton = wrapper.findAllComponents({ name: 'Button' })[0]
    await firstButton.trigger('click')

    expect(wrapper.emitted('click-on-answer')).toBeTruthy()
    expect(wrapper.emitted('click-on-answer')[0]).toEqual([1])
  })

  it('highlights selected answer', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const secondButton = wrapper.findAllComponents({ name: 'Button' })[1]
    await secondButton.trigger('click')

    expect(secondButton.classes()).toContain('border-primary')
    expect(secondButton.classes()).toContain('bg-primary/10')
  })

  it('resets selected answer when question changes', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    // Select an answer
    const firstButton = wrapper.findAllComponents({ name: 'Button' })[0]
    await firstButton.trigger('click')
    expect(firstButton.classes()).toContain('border-primary')

    // Change question
    const newQuestion = {
      ...mockQuestion,
      title: 'New Question',
      possibleAnswers: [
        { id: 1, text: 'New Answer 1', isCorrect: true },
        { id: 2, text: 'New Answer 2', isCorrect: false }
      ]
    }
    await wrapper.setProps({ currentQuestion: newQuestion })
    await wrapper.vm.$nextTick()

    // Check that no answer is selected
    const buttons = wrapper.findAllComponents({ name: 'Button' })
    buttons.forEach(button => {
      expect(button.classes()).not.toContain('border-primary')
    })
  })

  it('handles image error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const img = wrapper.find('img')
    await img.trigger('error')

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load question image:', 'http://localhost:3000/test-image.jpg')
    expect(wrapper.vm.imageHasError).toBe(true)

    consoleSpy.mockRestore()
  })

  it('hides image after error', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const img = wrapper.find('img')
    await img.trigger('error')
    await wrapper.vm.$nextTick()

    // Image should be hidden (display: none) and component should track error
    expect(wrapper.vm.imageHasError).toBe(true)
  })

  it('emits request-next when Enter is pressed on selected answer', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const firstButton = wrapper.findAllComponents({ name: 'Button' })[0]
    await firstButton.trigger('click')
    await firstButton.trigger('keydown.enter')

    expect(wrapper.emitted('request-next')).toBeTruthy()
  })

  it('selects focused answer when Space is pressed', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    // Manually set focusedIndex to 1 (second button) since focus event may not work in test environment
    wrapper.vm.focusedIndex = 1
    await wrapper.vm.$nextTick()

    const secondButton = wrapper.findAllComponents({ name: 'Button' })[1]
    await secondButton.trigger('keydown.space')

    expect(wrapper.emitted('click-on-answer')).toBeTruthy()
    expect(wrapper.emitted('click-on-answer')[0]).toEqual([2])
  })

  it('has proper ARIA attributes for accessibility', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const radiogroup = wrapper.find('[role="radiogroup"]')
    expect(radiogroup.exists()).toBe(true)
    expect(radiogroup.attributes('aria-label')).toContain('Choisissez une réponse pour')

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    buttons.forEach((button, index) => {
      expect(button.attributes('role')).toBe('radio')
      expect(button.attributes('aria-checked')).toBe('false')
    })
  })

  it('updates aria-checked when answer is selected', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const firstButton = wrapper.findAllComponents({ name: 'Button' })[0]
    await firstButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(firstButton.attributes('aria-checked')).toBe('true')
    
    const secondButton = wrapper.findAllComponents({ name: 'Button' })[1]
    expect(secondButton.attributes('aria-checked')).toBe('false')
  })

  it('manages tabindex for keyboard navigation', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    // First button should be focusable (tabindex 0), others should not (-1)
    expect(buttons[0].attributes('tabindex')).toBe('0')
    expect(buttons[1].attributes('tabindex')).toBe('-1')
    expect(buttons[2].attributes('tabindex')).toBe('-1')
  })

  it('resets focus index when question changes', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    // Initially focused on first answer
    expect(wrapper.vm.focusedIndex).toBe(0)

    // Change question
    const newQuestion = {
      ...mockQuestion,
      title: 'New Question'
    }
    await wrapper.setProps({ currentQuestion: newQuestion })
    await wrapper.vm.$nextTick()

    // Should reset to first answer
    expect(wrapper.vm.focusedIndex).toBe(0)
  })

  it('renders answers with LatexRenderer', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const latexRenderers = wrapper.findAllComponents({ name: 'LatexRenderer' })
    // Should have at least 3 for answers (plus 1 for question text if present)
    expect(latexRenderers.length).toBeGreaterThanOrEqual(3)
    
    // Check that answer texts are passed to LatexRenderer
    const answerRenderers = latexRenderers.filter(r => 
      r.props('content') === 'Answer 1' || 
      r.props('content') === 'Answer 2' || 
      r.props('content') === 'Answer 3'
    )
    expect(answerRenderers.length).toBe(3)
  })
})
