import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageUpload from '@/components/ImageUpload.vue'

describe('ImageUpload', () => {
  let wrapper

  beforeEach(() => {
    // Mock canvas and image APIs
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      canvas: { width: 800, height: 600 }
    }))
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockdata')
    
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.width = 1000
          this.height = 800
          this.onload()
        }, 0)
      }
    }

    wrapper = mount(ImageUpload, {
      props: {
        label: 'Upload Image'
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.find('label').text()).toBe('Upload Image')
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('displays preview when image is selected', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')
    
    // Mock the files property
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()
    // Wait for image compression to complete
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(wrapper.find('img[alt="Preview"]').exists()).toBe(true)
  })

  it('shows label when provided', () => {
    expect(wrapper.find('label').text()).toBe('Upload Image')
  })

  it('triggers file input when clicked', async () => {
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(fileInput.element, 'click')
    
    // Click on the upload area div which triggers file input
    await wrapper.find('div.cursor-pointer').trigger('click')
    
    expect(clickSpy).toHaveBeenCalled()
  })

  it('validates file size', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('La taille du fichier ne peut pas dépasser 1.0MB')
  })

  it('validates file type', async () => {
    const textFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [textFile],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('Seuls les fichiers image sont acceptés')
  })

  it('emits file-change event when valid file is selected', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()
    
    // Wait for image compression
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.emitted('file-change')).toBeTruthy()
  })

  it('removes image when remove button is clicked', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    const removeButton = wrapper.find('button')
    if (removeButton.exists()) {
      await removeButton.trigger('click')
      expect(wrapper.vm.selectedFile).toBeNull()
      expect(wrapper.vm.previewUrl).toBeNull()
    }
  })

  it('clears error when new valid file is selected', async () => {
    // First, create an error
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    let fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.error).toBeTruthy()

    // Then select a valid file
    const validFile = new File([''], 'valid.jpg', { type: 'image/jpeg' })
    
    // Redefine files on the existing input and trigger change
    Object.defineProperty(fileInput.element, 'files', {
      value: [validFile],
      writable: false,
      configurable: true
    })
    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('')
  })

  it('compresses large images', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()
    
    // Wait for image compression
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled()
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
  })
})