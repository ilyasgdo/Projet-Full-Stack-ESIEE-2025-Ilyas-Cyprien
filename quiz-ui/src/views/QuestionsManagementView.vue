<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-3xl font-bold">Gestion des Questions</h1>
        <div class="flex gap-2">
          <Button 
            @click="showCreateModal = true" 
            :disabled="loading"
            class="gap-2"
          >
            <Plus class="h-4 w-4" />
            Nouvelle Question
          </Button>
          <Button 
            @click="confirmDeleteAll" 
            variant="destructive"
            :disabled="loading || questions.length === 0"
            class="gap-2"
          >
            <Trash2 class="h-4 w-4" />
            Supprimer Tout
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-muted-foreground">Chargement des questions...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="questions.length === 0" class="text-center py-12">
        <div class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <HelpCircle class="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Aucune question</h3>
        <p class="text-muted-foreground mb-6">Commencez par créer votre première question pour le quiz.</p>
        <Button @click="showCreateModal = true" class="gap-2">
          <Plus class="h-4 w-4" />
          Créer une question
        </Button>
      </div>

      <!-- Questions List -->
      <div v-else class="grid gap-4">
        <Card 
          v-for="question in questions" 
          :key="question.id" 
          class="overflow-hidden"
        >
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3 flex-1">
                <Badge variant="secondary" class="shrink-0">
                  {{ question.position }}
                </Badge>
                <div class="flex-1 min-w-0">
                  <CardTitle class="text-lg mb-1">{{ question.title }}</CardTitle>
                  <CardDescription class="line-clamp-2">
                    {{ truncateText(question.text, 100) }}
                  </CardDescription>
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <Button 
                  @click="editQuestion(question)" 
                  variant="outline"
                  size="sm"
                  :disabled="loading"
                  class="gap-2"
                >
                  <Edit class="h-4 w-4" />
                  Modifier
                </Button>
                <Button 
                  @click="confirmDeleteQuestion(question)" 
                  variant="outline"
                  size="sm"
                  :disabled="loading"
                  class="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 class="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent class="pt-0">
            <div v-if="question.image" class="mb-4">
              <img 
                :src="question.image" 
                alt="Question image" 
                class="max-w-full h-auto rounded-md border"
              />
            </div>
            <div class="grid gap-2">
              <div 
                v-for="(answer, index) in (question.possibleAnswers || question.answers || [])" 
                :key="index"
                class="flex items-center gap-2 p-2 rounded-md border"
                :class="answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-muted/50'"
              >
                <div class="shrink-0">
                  <CheckCircle v-if="answer.isCorrect" class="h-4 w-4 text-green-600" />
                  <Circle v-else class="h-4 w-4 text-muted-foreground" />
                </div>
                <span class="text-sm">{{ answer.text }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Question Form Dialog -->
      <Dialog :open="showCreateModal || showEditModal" @update:open="closeModal">
        <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {{ editingQuestion ? 'Modifier la Question' : 'Nouvelle Question' }}
            </DialogTitle>
            <DialogDescription>
              {{ editingQuestion ? 'Modifiez les détails de la question ci-dessous.' : 'Créez une nouvelle question pour votre quiz.' }}
            </DialogDescription>
          </DialogHeader>
          
          <form @submit.prevent="saveQuestion" class="space-y-6">
            <div class="space-y-2">
              <Label for="title">Titre de la question *</Label>
              <Input 
                id="title"
                v-model="form.title" 
                placeholder="Entrez le titre de la question"
                :class="{ 'border-destructive': errors.title }"
                required
              />
              <p v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</p>
            </div>

            <div class="space-y-2">
              <Label for="text">Texte de la question *</Label>
              <Textarea 
                id="text"
                v-model="form.text" 
                placeholder="Entrez le texte de la question"
                rows="3"
                :class="{ 'border-destructive': errors.text }"
                required
              />
              <p v-if="errors.text" class="text-sm text-destructive">{{ errors.text }}</p>
            </div>

            <div class="space-y-2">
              <Label>Image (optionnelle)</Label>
              <div v-if="!form.image" 
                   @click="triggerFileInput"
                   class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <input 
                  ref="fileInput" 
                  type="file" 
                  @change="handleImageUpload" 
                  accept="image/*" 
                  class="hidden"
                />
                <Upload class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p class="text-sm text-muted-foreground mb-1">Cliquez pour sélectionner une image</p>
                <p class="text-xs text-muted-foreground">Formats acceptés: JPG, PNG, GIF (max 5MB)</p>
              </div>
              <div v-else class="relative">
                <img :src="form.image" alt="Preview" class="max-w-full h-auto rounded-md border" />
                <Button 
                  type="button" 
                  @click="removeImage" 
                  variant="destructive"
                  size="sm"
                  class="absolute top-2 right-2 gap-1"
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
              <p v-if="errors.image" class="text-sm text-destructive">{{ errors.image }}</p>
            </div>

            <div class="space-y-4">
              <Label>Réponses *</Label>
              <div class="space-y-3">
                <div 
                  v-for="(answer, index) in form.answers" 
                  :key="index"
                  class="space-y-2"
                >
                  <div class="flex gap-2">
                    <Input 
                      v-model="answer.text" 
                      :placeholder="`Réponse ${index + 1}`"
                      :class="{ 'border-destructive': errors[`answer_${index}`] }"
                      class="flex-1"
                      required
                    />
                    <div class="flex items-center space-x-2">
                      <input 
                        :id="`correct_${index}`"
                        v-model="form.correctAnswerIndex" 
                        :value="index" 
                        type="radio" 
                        name="correctAnswer"
                        class="w-4 h-4 text-primary"
                        required
                      />
                      <Label :for="`correct_${index}`" class="text-sm font-normal">
                        Correcte
                      </Label>
                    </div>
                  </div>
                  <p v-if="errors[`answer_${index}`]" class="text-sm text-destructive">
                    {{ errors[`answer_${index}`] }}
                  </p>
                </div>
              </div>
              <p v-if="errors.answers" class="text-sm text-destructive">{{ errors.answers }}</p>
            </div>

            <DialogFooter>
              <Button type="button" @click="closeModal" variant="outline">
                Annuler
              </Button>
              <Button type="submit" :disabled="saving" class="gap-2">
                <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
                <Save v-else class="h-4 w-4" />
                {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <!-- Confirm Delete Alert Dialog -->
      <AlertDialog :open="showDeleteConfirm" @update:open="showDeleteConfirm = false">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              <span v-if="questionToDelete">
                Êtes-vous sûr de vouloir supprimer la question "{{ questionToDelete.title }}" ?
              </span>
              <span v-else>
                Êtes-vous sûr de vouloir supprimer TOUTES les questions ? Cette action est irréversible.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction @click="executeDelete" :disabled="deleting" class="gap-2">
              <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
              <Trash2 v-else class="h-4 w-4" />
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  Plus, 
  Trash2, 
  Edit, 
  HelpCircle, 
  CheckCircle, 
  Circle, 
  Upload, 
  Save, 
  Loader2 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import QuizApiService from '../services/QuizApiService.js'
import AuthStorageService from '../services/AuthStorageService.js'

// Data
const questions = ref([])
const editingQuestion = ref(null)
const questionToDelete = ref(null)

// UI States
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

// Modal States
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)

// Form Data
const form = ref({
  title: '',
  text: '',
  image: null,
  answers: [
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' }
  ],
  correctAnswerIndex: 0
})

// Validation
const errors = ref({})

// File input ref
const fileInput = ref(null)

onMounted(async () => {
  await loadQuestions()
})

const loadQuestions = async () => {
  try {
    loading.value = true
    const token = AuthStorageService.getToken()
    if (token) {
      // Use admin endpoint to get all questions
      const response = await QuizApiService.getAllQuestions(token)
      questions.value = response.data.questions || []
    } else {
      // Fallback to public quiz-info endpoint (only returns count)
      const response = await QuizApiService.getQuizInfo()
      questions.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des questions:', error)
    questions.value = []
  } finally {
    loading.value = false
  }
}

const editQuestion = (question) => {
  editingQuestion.value = question
  form.value = {
    title: question.title,
    text: question.text,
    image: question.image,
    answers: (question.possibleAnswers || question.answers || []).map(a => ({ text: a.text })),
    correctAnswerIndex: (question.possibleAnswers || question.answers || []).findIndex(a => a.isCorrect)
  }
  showEditModal.value = true
  errors.value = {}
}

const confirmDeleteQuestion = (question) => {
  questionToDelete.value = question
  showDeleteConfirm.value = true
}

const confirmDeleteAll = () => {
  questionToDelete.value = null
  showDeleteConfirm.value = true
}

const executeDelete = async () => {
  try {
    deleting.value = true
    const token = AuthStorageService.getToken()
    
    if (questionToDelete.value) {
      await QuizApiService.deleteQuestion(questionToDelete.value.id, token)
    } else {
      await QuizApiService.deleteAllQuestions(token)
    }
    
    await loadQuestions()
    showDeleteConfirm.value = false
    questionToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    deleting.value = false
  }
}

const saveQuestion = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    saving.value = true
    const questionData = formatQuestionData()
    const token = AuthStorageService.getToken()
    
    console.log('Sending question data:', questionData)
    console.log('Token:', token ? 'Present' : 'Missing')
    
    if (editingQuestion.value) {
      const response = await QuizApiService.updateQuestion(editingQuestion.value.id, questionData, token)
      console.log('Update response:', response)
    } else {
      const response = await QuizApiService.createQuestion(questionData, token)
      console.log('Create response:', response)
    }
    
    await loadQuestions()
    closeModal()
    
    // Show success notification
    console.log('Question sauvegardée avec succès!')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    
    // Extract meaningful error message
    let errorMessage = 'Erreur lors de la sauvegarde'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.message) {
      errorMessage = error.message
    }
    
    console.error('Erreur lors de la sauvegarde:', errorMessage)
  } finally {
    saving.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Le titre est obligatoire'
  } else if (form.value.title.length > 255) {
    errors.value.title = 'Le titre ne peut pas dépasser 255 caractères'
  }
  
  if (!form.value.text.trim()) {
    errors.value.text = 'Le texte est obligatoire'
  }
  
  // Validate answers - API expects exactly 4 answers
  if (form.value.answers.length !== 4) {
    errors.value.answers = 'Exactement 4 réponses sont requises'
    return false
  }
  
  const emptyAnswers = form.value.answers.filter(a => !a.text.trim())
  if (emptyAnswers.length > 0) {
    errors.value.answers = 'Toutes les réponses doivent être remplies'
    emptyAnswers.forEach((_, index) => {
      const actualIndex = form.value.answers.findIndex(a => !a.text.trim())
      if (actualIndex !== -1) {
        errors.value[`answer_${actualIndex}`] = 'Cette réponse est obligatoire'
      }
    })
  }
  
  // Validate that exactly one correct answer is selected
  if (form.value.correctAnswerIndex < 0 || form.value.correctAnswerIndex >= 4) {
    errors.value.correctAnswer = 'Une réponse correcte doit être sélectionnée'
  }
  
  return Object.keys(errors.value).length === 0
}

const formatQuestionData = () => {
  const nextPosition = editingQuestion.value 
    ? editingQuestion.value.position 
    : Math.max(...questions.value.map(q => q.position), 0) + 1
    
  return {
    title: form.value.title.trim(),
    text: form.value.text.trim(),
    image: form.value.image,
    position: nextPosition,
    possibleAnswers: form.value.answers.map((answer, index) => ({
      text: answer.text.trim(),
      isCorrect: index === form.value.correctAnswerIndex
    }))
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingQuestion.value = null
  resetForm()
  errors.value = {}
}

const resetForm = () => {
  form.value = {
    title: '',
    text: '',
    image: null,
    answers: [
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' }
    ],
    correctAnswerIndex: 0
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errors.value.image = 'La taille du fichier ne peut pas dépasser 5MB'
    return
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    errors.value.image = 'Seuls les fichiers image sont acceptés'
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.image = e.target.result
    delete errors.value.image
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  form.value.image = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
</script>