<script setup>
// Quiz Application Main Layout
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition duration-200">
          Quiz App
        </router-link>
        
        <div class="flex space-x-4">
          <router-link 
            to="/" 
            class="text-gray-700 hover:text-blue-600 transition duration-200"
            active-class="text-blue-600 font-semibold"
          >
            Accueil
          </router-link>
          <router-link 
            to="/admin" 
            class="text-gray-700 hover:text-blue-600 transition duration-200"
            active-class="text-blue-600 font-semibold"
          >
            Administration
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 Quiz Application. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global styles handled by Tailwind CSS */
</style>
