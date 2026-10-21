import { describe, it, expect } from "vitest"
import { type CreateTicketProps, Ticket } from "../../src/domain/entities/ticket.entity.js"
import { InvalidTitleError } from "../../src/domain/errors/TicketError.js"
import { randomUUID } from "node:crypto";



describe('Ticket Entity', () => {

  it('should not create title if length is less than 3', ()=> {

    const ticket: CreateTicketProps = {
    id : "1",
    key: "PROJ-1",
    title: "ab   ",
    description: "Ticket description for testing with vitest",
    type: "Bug",
    priority: "Low",
    reporterId: randomUUID(),
    projectId: randomUUID(),
    createdAt: new Date()
  }

  expect( ()=> {
    Ticket.create(ticket);
  }).toThrow(InvalidTitleError)
  
  
  })
})
