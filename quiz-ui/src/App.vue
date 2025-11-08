<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-vue-next'
import NotificationContainer from '@/components/NotificationContainer.vue'
import logo from '@/assets/logo.png'

const isMenuOpen = ref(false)
</script>

<template>
  <div id="app" class="min-h-screen bg-modern math-overlay flex flex-col">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-primary/10 via-background/80 to-secondary/10 backdrop-blur supports-[backdrop-filter]:bg-background/20">
      <div class="container mx-auto px-4 lg:px-6">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <router-link 
            to="/" 
            class="flex items-center space-x-3 text-foreground hover:text-primary transition-colors"
            aria-label="Aller à l'accueil"
          >
            <img :src="logo" alt="Qrious logo" class="h-10 w-auto object-contain" />
            <span class="hidden sm:inline-block text-gradient text-2xl font-black tracking-tight">Qrious</span>
          </router-link>
          
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-1" role="navigation" aria-label="Navigation principale">
            <Button 
              variant="ghost" 
              as-child
              class="text-sm font-medium hover-float"
            >
              <router-link to="/">
                Accueil
              </router-link>
            </Button>
            <Button 
              variant="ghost" 
              as-child
              class="text-sm font-medium hover-float"
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
    <main id="main-content" tabindex="-1" class="flex-1 flex flex-col container mx-auto px-4 lg:px-6 max-w-7xl w-full" role="main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-muted/50 mt-auto">
      <div class="container mx-auto px-4 lg:px-6 py-4">
        <div class="text-right text-sm text-muted-foreground">
          <p>&copy; 2025</p>
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
