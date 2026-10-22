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
    createdAt: new Date("2026-10-21T12:00:00.000Z")
  }

  expect( ()=> {
    Ticket.create(ticket);
  }).toThrow(InvalidTitleError)
  
  
  })

  it("creates a ticket with three-characters title after trimming", () => {
    const ticket2: CreateTicketProps = {
    id : "2",
    key: "PROJ-1",
    title: "  abs   ",
    description: "Ticket description for testing with vitest",
    type: "Bug",
    priority: "Low",
    reporterId: randomUUID(),
    projectId: randomUUID(),
    createdAt: new Date("2026-10-21T12:00:00.000Z")
    }

    const createdTicket = Ticket.create(ticket2);

    expect(createdTicket.title).toBe("abs")
    expect(createdTicket.status).toBe("Open")
  })
})
