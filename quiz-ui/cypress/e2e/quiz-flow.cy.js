describe('Quiz Application - Complete User Flow', () => {
  beforeEach(() => {
    // Mock quiz info response
    cy.intercept('GET', '/quiz-info', {
      statusCode: 200,
      body: {
        size: 3,
        scores: []
      }
    }).as('getQuizInfo')
    
    // Mock questions responses
    cy.intercept('GET', '/questions?position=1', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'Question 1',
        text: 'What is the first question?',
        image: null,
        position: 1,
        possibleAnswers: [
          { text: 'Answer 1', isCorrect: true },
          { text: 'Answer 2', isCorrect: false },
          { text: 'Answer 3', isCorrect: false },
          { text: 'Answer 4', isCorrect: false }
        ]
      }
    }).as('getQuestion1')
    
    cy.intercept('GET', '/questions?position=2', {
      statusCode: 200,
      body: {
        id: 2,
        title: 'Question 2',
        text: 'What is the second question?',
        image: null,
        position: 2,
        possibleAnswers: [
          { text: 'Answer A', isCorrect: false },
          { text: 'Answer B', isCorrect: true },
          { text: 'Answer C', isCorrect: false },
          { text: 'Answer D', isCorrect: false }
        ]
      }
    }).as('getQuestion2')
    
    cy.intercept('GET', '/questions?position=3', {
      statusCode: 200,
      body: {
        id: 3,
        title: 'Question 3',
        text: 'What is the third question?',
        image: null,
        position: 3,
        possibleAnswers: [
          { text: 'Option 1', isCorrect: false },
          { text: 'Option 2', isCorrect: false },
          { text: 'Option 3', isCorrect: true },
          { text: 'Option 4', isCorrect: false }
        ]
      }
    }).as('getQuestion3')
    
    // Mock participation submission
    cy.intercept('POST', '/participations', {
      statusCode: 200,
      body: {
        score: 3,
        answersSummaries: [
          { wasCorrect: true },
          { wasCorrect: true },
          { wasCorrect: true }
        ]
      }
    }).as('submitParticipation')
  })

  it('should complete the full quiz flow from start to finish', () => {
    // 1. Visit home page and check quiz info
    cy.visit('/')
    cy.wait('@getQuizInfo')
    
    // Check that the page loads correctly
    cy.contains('Bienvenue au Quiz').should('be.visible')
    cy.get('a').contains('Participer au Quiz').should('be.visible')
    
    // 2. Navigate to new quiz page
    cy.get('a').contains('Participer au Quiz').click()
    cy.url().should('include', '/new-quiz')
    
    // 3. Enter player name and start quiz
    const playerName = 'Cypress Test Player'
    cy.get('#playerName').type(playerName)
    cy.get('button[type="submit"]').contains('Commencer le Quiz').click()
    
    // 4. Answer questions
    cy.wait('@getQuestion1')
    cy.url().should('include', '/quiz')
    
    // Check question structure
    cy.get('h2').should('be.visible') // Question title
    
    // Answer first question - click on first answer button that's not navigation
    cy.get('button').contains('Answer 1').click()
    
    // Check if "Suivant" button is enabled and click it
    cy.get('button').contains('Suivant').should('not.be.disabled').click()
    
    // Answer second question
    cy.wait('@getQuestion2')
    cy.get('button').contains('Answer B').click()
    cy.get('button').contains('Suivant').should('not.be.disabled').click()
    
    // Answer third question
    cy.wait('@getQuestion3')
    cy.get('button').contains('Option 3').click()
    cy.get('button').contains('Terminer').should('not.be.disabled').click()
    
    // 5. Check results page
    cy.wait('@submitParticipation')
    cy.url().should('include', '/score')
    cy.contains('Quiz Terminé').should('be.visible')
    cy.contains(playerName).should('be.visible')
    
    // 6. Return to home page
    // The "Retour à l'accueil" button is rendered as an anchor via as-child
    cy.get('a').contains("Retour à l'accueil").click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should display previous scores on home page', () => {
    // Mock quiz info with scores
    cy.intercept('GET', '/quiz-info', {
      statusCode: 200,
      body: {
        size: 3,
        scores: [
          { playerName: 'Player 1', score: 3, date: '2024-01-01' },
          { playerName: 'Player 2', score: 2, date: '2024-01-02' }
        ]
      }
    }).as('getQuizInfoWithScores')
    
    cy.visit('/')
    cy.wait('@getQuizInfoWithScores')
    
    // Should display previous scores
    cy.contains('Meilleurs Scores').should('be.visible')
    cy.contains('Player 1').should('be.visible')
    cy.contains('Player 2').should('be.visible')
  })

  it('should handle empty quiz gracefully', () => {
    // Mock empty quiz
    cy.intercept('GET', '/quiz-info', { 
      statusCode: 200,
      body: { size: 0, scores: [] } 
    }).as('getEmptyQuizInfo')
    
    cy.visit('/')
    cy.wait('@getEmptyQuizInfo')
    
    // Should still show the interface
    cy.contains('Bienvenue au Quiz').should('be.visible')
    cy.get('a').contains('Participer au Quiz').should('be.visible')
  })
})