describe('Admin Interface Tests', () => {
  beforeEach(() => {
    // Intercept API calls with proper status codes
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token' }
    }).as('login')
    
    cy.intercept('GET', '**/questions/all', {
      statusCode: 200,
      body: { questions: [] }
    }).as('getQuestions')
    
    cy.intercept('POST', '**/questions', {
      statusCode: 201,
      body: { id: 1, message: 'Question created successfully' }
    }).as('createQuestion')
    
    cy.intercept('PUT', '**/questions/*', {
      statusCode: 200,
      body: { message: 'Question updated successfully' }
    }).as('updateQuestion')
    
    cy.intercept('DELETE', '**/questions/*', {
      statusCode: 204,
      body: {}
    }).as('deleteQuestion')
    
    cy.intercept('POST', '**/questions/*/image', {
      statusCode: 200,
      body: { message: 'Image uploaded successfully' }
    }).as('uploadImage')
  })

  it('should login successfully with correct password', () => {
    cy.visit('/admin')
    
    // Check login form is visible
    cy.contains('Connexion Administrateur').should('be.visible')
    cy.get('#password').should('be.visible')
    
    // Login with correct password
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    
    cy.wait('@login')
    
    // Should see admin dashboard
    cy.contains('Tableau de bord').should('be.visible')
    cy.contains('Déconnexion').should('be.visible')
  })

  it('should show error with incorrect password', () => {
    cy.visit('/admin')
    
    // Mock failed login
    cy.intercept('POST', '/login', { 
      statusCode: 401, 
      body: { message: 'Unauthorized' } 
    }).as('failedLogin')
    
    cy.get('#password').type('wrongpassword')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    
    cy.wait('@failedLogin')
    
    // Should show error message
    cy.get('.text-destructive').should('be.visible')
  })

  it('should create a new question', () => {
    // Login first
    cy.visit('/admin')
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    cy.wait('@login')
    
    // Navigate to questions management
    cy.get('a[href="/admin/questions"]').click()
    cy.wait('@getQuestions')
    
    // Click on create new question button
    cy.contains('Nouvelle Question').click()
    
    // Fill form
    cy.get('#title').type('Test Question Title')
    cy.get('#text').type('What is the answer to this test question?')
    cy.get('input[placeholder="Réponse 1"]').type('Answer 1')
    cy.get('input[placeholder="Réponse 2"]').type('Answer 2')
    cy.get('input[placeholder="Réponse 3"]').type('Answer 3')
    cy.get('input[placeholder="Réponse 4"]').type('Answer 4')
    
    // Select correct answer (first radio button)
    cy.get('#correct_0').check()
    
    // Submit form
    cy.contains('Sauvegarder').click()
    
    cy.wait('@createQuestion')
    
    // Should show success notification
    cy.get('[data-testid="notification-success"]', { timeout: 8000 })
      .should('be.visible')
      .and('contain.text', 'Question créée avec succès')
  })

  it('should edit an existing question', () => {
    // Mock questions list
    cy.intercept('GET', '**/questions/all', {
      statusCode: 200,
      body: { questions: [{
        id: 1,
        title: 'Existing Question',
        text: 'What is this?',
        position: 1,
        possibleAnswers: [
          { text: 'Answer 1', isCorrect: true },
          { text: 'Answer 2', isCorrect: false },
          { text: 'Answer 3', isCorrect: false },
          { text: 'Answer 4', isCorrect: false }
        ]
      }] }
    }).as('getQuestionsWithData')
    
    // Login first
    cy.visit('/admin')
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    cy.wait('@login')
    
    // Navigate to questions management
    cy.get('a[href="/admin/questions"]').click()
    
    cy.wait('@getQuestionsWithData')
    // Ensure question card is rendered
    cy.contains('Existing Question').should('be.visible')
    
    // Click edit button using stable test id
    cy.get('[data-testid="edit-question"]').first().should('be.enabled').scrollIntoView().click({ force: true })
    
    // Ensure edit dialog is open
    cy.contains('Modifier la Question').should('be.visible')
    
    // Update question
    cy.get('#title').clear().type('Updated Question Title')
    
    // Intercept the questions reload after update
    cy.intercept('GET', '**/questions/all').as('reloadQuestionsAfterUpdate')

    // Submit form
    cy.contains('Sauvegarder').click()
    
    cy.wait('@updateQuestion')
    // Wait for questions reload after update
    cy.wait('@reloadQuestionsAfterUpdate')
    
    // Should show success notification
    cy.get('[data-testid="notification-success"]', { timeout: 8000 })
      .should('be.visible')
      .and('contain.text', 'Question modifiée avec succès')
  })

  it('should delete a question', () => {
    // Mock questions list
    cy.intercept('GET', '**/questions/all', {
      statusCode: 200,
      body: { questions: [{
        id: 1,
        title: 'Question to Delete',
        text: 'This will be deleted',
        position: 1,
        possibleAnswers: [
          { text: 'Answer 1', isCorrect: true },
          { text: 'Answer 2', isCorrect: false }
        ]
      }] }
    }).as('getQuestionsWithData')
    
    // Login first
    cy.visit('/admin')
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    cy.wait('@login')
    
    // Navigate to questions management
    cy.get('a[href="/admin/questions"]').click()
    
    cy.wait('@getQuestionsWithData')
    // Ensure question card is rendered
    cy.contains('Question to Delete').should('be.visible')
    
    // Click delete button using stable test id
    cy.get('[data-testid="delete-question"]').first().should('be.enabled').scrollIntoView().click({ force: true })
    
    // Confirm deletion
    cy.contains('Confirmer la suppression').should('be.visible')
    // Intercept the questions reload after delete
    cy.intercept('GET', '**/questions/all').as('reloadQuestionsAfterDelete')
    cy.get('[data-testid="confirm-delete"]').click()
    
    cy.wait('@deleteQuestion')
    // Wait for questions reload after delete
    cy.wait('@reloadQuestionsAfterDelete')
    
    // Should show success notification
    cy.get('[data-testid="notification-success"]', { timeout: 8000 })
      .should('be.visible')
      .and('contain.text', 'Question supprimée avec succès')
  })

  it('should validate form fields', () => {
    // Login first
    cy.visit('/admin')
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    cy.wait('@login')
    
    // Navigate to questions management
    cy.contains('Gérer les Questions').click()
    
    // Click on create new question button
    cy.contains('Nouvelle Question').click()
    
    // Try to submit empty form
    cy.contains('Sauvegarder').click()
    
    // Should show validation errors (HTML5 validation)
    cy.get('#title:invalid').should('exist')
    cy.get('#text:invalid').should('exist')
  })

  it('should upload an image for a question', () => {
    // Login first
    cy.visit('/admin')
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    cy.wait('@login')
    
    // Navigate to questions management
    cy.get('a[href="/admin/questions"]').click()
    
    // Click on create new question button
    cy.contains('Nouvelle Question').click()
    
    // Fill required fields
    cy.get('#title').type('Question with Image')
    cy.get('#text').type('This question has an image')
    cy.get('input[placeholder="Réponse 1"]').type('Answer 1')
    cy.get('input[placeholder="Réponse 2"]').type('Answer 2')
    cy.get('input[placeholder="Réponse 3"]').type('Answer 3')
    cy.get('input[placeholder="Réponse 4"]').type('Answer 4')
    
    // Select correct answer
    cy.get('#correct_0').check()
    
    // Upload image
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png', { force: true })
    
    // Submit form
    cy.contains('Sauvegarder').click()
    
    cy.wait('@createQuestion')
    
    // Should show success message
    cy.contains('Question créée avec succès').should('be.visible')
  })

  it('should logout successfully', () => {
    // Login first
    cy.visit('/admin')
    cy.get('#password').type('iloveflask')
    cy.get('button[type="submit"]').contains('Se connecter').click()
    cy.wait('@login')
    
    // Logout
    cy.contains('Déconnexion').click()
    
    // Should return to login form
    cy.contains('Connexion Administrateur').should('be.visible')
  })
})