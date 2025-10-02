<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-vue-next'
import NotificationContainer from '@/components/NotificationContainer.vue'

const isMenuOpen = ref(false)
</script>

<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 lg:px-6">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <router-link 
            to="/" 
            class="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
            aria-label="Aller à l'accueil"
          >
            <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-sm">Q</span>
            </div>
            <span class="hidden sm:inline-block">Quiz App</span>
          </router-link>
          
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-1" role="navigation" aria-label="Navigation principale">
            <Button 
              variant="ghost" 
              as-child
              class="text-sm font-medium"
            >
              <router-link to="/">
                Accueil
              </router-link>
            </Button>
            <Button 
              variant="ghost" 
              as-child
              class="text-sm font-medium"
            >
              <router-link to="/admin">
                Administration
              </router-link>
            </Button>
          </nav>

          <!-- Mobile Navigation -->
          <Sheet v-model:open="isMenuOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden" aria-haspopup="dialog" aria-controls="mobile-menu" aria-label="Ouvrir le menu">
                <Menu class="h-5 w-5" />
                <span class="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="w-[300px] sm:w-[400px]" id="mobile-menu" role="dialog" aria-label="Menu mobile">
              <nav class="flex flex-col space-y-4 mt-6" role="navigation" aria-label="Navigation mobile">
                <router-link 
                  to="/" 
                  @click="isMenuOpen = false"
                  class="flex items-center space-x-2 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  aria-label="Aller à l'accueil"
                >
                  Accueil
                </router-link>
                <router-link 
                  to="/admin" 
                  @click="isMenuOpen = false"
                  class="flex items-center space-x-2 text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  aria-label="Aller à l'administration"
                >
                  Administration
                </router-link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" tabindex="-1" class="flex-1 container mx-auto px-4 lg:px-6 max-w-7xl" role="main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-muted/50">
      <div class="container mx-auto px-4 lg:px-6 py-6">
        <div class="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Quiz Application. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
    
    <!-- Notifications -->
    <NotificationContainer />
  </div>
</template>

<style>
/* Global styles handled by Tailwind CSS and shadcn-vue */
</style>
