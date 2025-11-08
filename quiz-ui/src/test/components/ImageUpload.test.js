import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageUpload from '@/components/ImageUpload.vue'

describe('ImageUpload', () => {
  let mockImageOnload
  let mockImageOnerror
  let mockCreateObjectURL
  let mockRevokeObjectURL

  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    mockRevokeObjectURL = vi.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock canvas
    const mockContext = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: ''
    }
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockdata')
    
    // Mock Image constructor
    mockImageOnload = null
    mockImageOnerror = null
    
    global.Image = class MockImage {
      constructor() {
        this.width = 1000
        this.height = 800
        this.onload = null
        this.onerror = null
        this.src = ''
        
        // Store callbacks
        Object.defineProperty(this, 'onload', {
          get: () => mockImageOnload,
          set: (fn) => {
            mockImageOnload = fn
            // Simulate async image load
            setTimeout(() => {
              if (mockImageOnload) {
                mockImageOnload()
              }
            }, 0)
          },
          configurable: true
        })
        
        Object.defineProperty(this, 'onerror', {
          get: () => mockImageOnerror,
          set: (fn) => {
            mockImageOnerror = fn
          },
          configurable: true
        })
      }
    }
  })

  const waitForImageLoad = () => new Promise(resolve => setTimeout(resolve, 10))

  it('renders correctly', () => {
    const wrapper = mount(ImageUpload, {
      props: {
        label: 'Upload Image'
      }
    })

    expect(wrapper.find('label').text()).toBe('Upload Image')
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('does not render label when not provided', () => {
    const wrapper = mount(ImageUpload, {
      props: {}
    })

    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('displays preview when image is selected', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload, {
      props: {
        label: 'Upload Image'
      }
    })
    
    const fileInput = wrapper.find('input[type="file"]')
    
    // Mock the files property
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Prévisualisation image')
  })

  it('shows label when provided', () => {
    const wrapper = mount(ImageUpload, {
      props: {
        label: 'Upload Image'
      }
    })

    expect(wrapper.find('label').text()).toBe('Upload Image')
  })

  it('triggers file input when upload area is clicked', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        label: 'Upload Image'
      }
    })
    
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(fileInput.element, 'click')
    
    // Click on the upload area div which triggers file input
    const uploadArea = wrapper.find('.cursor-pointer')
    await uploadArea.trigger('click')
    
    expect(clickSpy).toHaveBeenCalled()
  })

  it('validates file size', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload, {
      props: {
        maxSizeBytes: 1024 * 1024 // 1MB
      }
    })
    
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
    const wrapper = mount(ImageUpload)
    
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
    const wrapper = mount(ImageUpload)
    
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('file-change')).toBeTruthy()
    expect(wrapper.emitted('file-change')[0][0]).toBe('data:image/jpeg;base64,mockdata')
  })

  it('removes image when remove button is clicked', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload)
    
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    // Find the delete button (Button component with destructive variant)
    const buttons = wrapper.findAllComponents({ name: 'Button' })
    const deleteButton = buttons.find(btn => btn.props('variant') === 'destructive')
    
    expect(deleteButton.exists()).toBe(true)
    await deleteButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.imageDataUrl).toBeNull()
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.emitted('file-change')[wrapper.emitted('file-change').length - 1][0]).toBeNull()
  })

  it('clears error when new valid file is selected', async () => {
    const wrapper = mount(ImageUpload)
    
    // First, create an error
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')
    
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
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [validFile],
      writable: false,
      configurable: true
    })
    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('')
  })

  it('compresses large images', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload)
    
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled()
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
  })

  it('handles image compression errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload)
    
    // Make image load fail
    const originalImage = global.Image
    global.Image = class {
      constructor() {
        this.onload = null
        this.onerror = null
        this.src = ''
        setTimeout(() => {
          if (this.onerror) {
            this.onerror()
          }
        }, 0)
      }
    }
    
    const fileInput = wrapper.find('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('Erreur lors du traitement de l\'image')
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    global.Image = originalImage
    consoleErrorSpy.mockRestore()
  })

  it('updates imageDataUrl when fileDataUrl prop changes', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        fileDataUrl: null
      }
    })

    expect(wrapper.vm.imageDataUrl).toBeNull()

    await wrapper.setProps({ fileDataUrl: 'data:image/jpeg;base64,test123' })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.imageDataUrl).toBe('data:image/jpeg;base64,test123')
  })

  it('displays image when fileDataUrl prop is provided', () => {
    const wrapper = mount(ImageUpload, {
      props: {
        fileDataUrl: 'data:image/jpeg;base64,test123'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/jpeg;base64,test123')
  })

  it('shows replace button when image is displayed', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload)
    
    const fileInput = wrapper.find('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await waitForImageLoad()
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    const replaceButton = buttons.find(btn => btn.text().includes('Remplacer'))
    expect(replaceButton.exists()).toBe(true)
  })

  it('does not process when no file is selected', async () => {
    const wrapper = mount(ImageUpload)
    const fileInput = wrapper.find('input[type="file"]')
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.imageDataUrl).toBeNull()
    expect(wrapper.emitted('file-change')).toBeFalsy()
  })

  it('uses custom maxSizeBytes prop', async () => {
    const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const wrapper = mount(ImageUpload, {
      props: {
        maxSizeBytes: 2 * 1024 * 1024 // 2MB
      }
    })
    
    const fileInput = wrapper.find('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
      configurable: true
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('La taille du fichier ne peut pas dépasser 2.0MB')
  })
})
