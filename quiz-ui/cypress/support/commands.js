// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login as admin
Cypress.Commands.add('loginAsAdmin', (password = 'iloveflask') => {
  cy.visit('/admin')
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/admin')
})

// Custom command to start a new quiz
Cypress.Commands.add('startQuiz', (playerName = 'Test Player') => {
  cy.visit('/')
  cy.get('input[placeholder*="nom"]').type(playerName)
  cy.get('button').contains('Commencer').click()
})

// Custom command to answer a question
Cypress.Commands.add('answerQuestion', (answerIndex = 0) => {
  cy.get('.answer-option').eq(answerIndex).click()
  cy.get('button').contains('Suivant').click()
})

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201, 204])
  })
})