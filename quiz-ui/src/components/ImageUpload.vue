<template>
  <div class="space-y-2">
    <Label v-if="label">{{ label }}</Label>
    <input 
      ref="fileInput" 
      type="file" 
      @change="handleFileChange" 
      accept="image/*" 
      class="hidden"
    />
    
    <div v-if="!imageDataUrl" 
         @click="triggerFileInput"
         class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
      <Upload class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p class="text-sm text-muted-foreground mb-1">Cliquez pour sélectionner une image</p>
      <p class="text-xs text-muted-foreground">Formats acceptés: JPG, PNG, GIF (max 1MB)</p>
    </div>
    
    <div 
      v-else 
      class="relative w-full h-40 rounded-lg border bg-muted/10 overflow-hidden group"
      @click="triggerFileInput"
      title="Cliquez pour remplacer l'image"
    >
      <img 
        :src="imageDataUrl" 
        alt="Prévisualisation image" 
        class="w-full h-full object-contain"
      />
      <div class="absolute top-2 right-2 flex gap-2">
        <Button 
          type="button"
          size="sm"
          variant="secondary"
          @click.stop="triggerFileInput"
        >
          Remplacer
        </Button>
        <Button 
          type="button" 
          @click.stop="removeImage" 
          variant="destructive"
          size="sm"
          class="gap-1"
        >
          <Trash2 class="h-3 w-3" />
          Supprimer
        </Button>
      </div>
    </div>
    
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  fileDataUrl: {
    type: String,
    default: null
  },
  label: {
    type: String,
    default: null
  },
  maxSizeBytes: {
    type: Number,
    default: 1024 * 1024
  }
})

const emit = defineEmits(['file-change'])

const fileInput = ref(null)
const imageDataUrl = ref(props.fileDataUrl)
const error = ref('')

watch(() => props.fileDataUrl, (newValue) => {
  imageDataUrl.value = newValue
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  error.value = ''
  
  if (file.size > props.maxSizeBytes) {
    const maxSizeMB = (props.maxSizeBytes / (1024 * 1024)).toFixed(1)
    error.value = `La taille du fichier ne peut pas dépasser ${maxSizeMB}MB`
    return
  }
  
  if (!file.type.startsWith('image/')) {
    error.value = 'Seuls les fichiers image sont acceptés'
    return
  }
  
  compressImage(file)
    .then(compressedBase64 => {
      imageDataUrl.value = compressedBase64
      emit('file-change', compressedBase64)
    })
    .catch(err => {
      console.error('Erreur lors de la compression:', err)
      error.value = 'Erreur lors du traitement de l\'image'
    })
}

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
  img.onload = () => {
      const maxSize = 800
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
    canvas.width = width
    canvas.height = height
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    ctx.drawImage(img, 0, 0, width, height)
    
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
      resolve(compressedBase64)
    }
    
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
    
    img.src = URL.createObjectURL(file)
  })
}

const removeImage = () => {
  imageDataUrl.value = null
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('file-change', null)
}
</script>