import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionDisplay from '@/components/QuestionDisplay.vue'

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

  it('renders question title', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    expect(wrapper.find('h2').text()).toBe('Test Question')
  })

  it('renders question text', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    expect(wrapper.find('p').text()).toBe('What is the answer?')
  })

  it('renders question image with lazy loading', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('http://localhost:3000/test-image.jpg')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('does not render image when not provided', () => {
    const questionWithoutImage = { ...mockQuestion, image: null }
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: questionWithoutImage }
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders all possible answers as buttons', () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    // Find Button components instead of button elements
    const buttons = wrapper.findAllComponents({ name: 'Button' })
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toContain('Answer 1')
    expect(buttons[1].text()).toContain('Answer 2')
    expect(buttons[2].text()).toContain('Answer 3')
  })

  it('emits click-on-answer when answer is clicked', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    // Find Button components instead of button elements
    const firstButton = wrapper.findAllComponents({ name: 'Button' })[0]
    await firstButton.trigger('click')

    expect(wrapper.emitted('click-on-answer')).toBeTruthy()
    expect(wrapper.emitted('click-on-answer')[0]).toEqual([1])
  })

  it('highlights selected answer', async () => {
    const wrapper = mount(QuestionDisplay, {
      props: { currentQuestion: mockQuestion }
    })

    // Find Button components instead of button elements
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

    consoleSpy.mockRestore()
  })
})