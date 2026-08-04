/*
  Warnings:

  - The values [In Progress] on the enum `Ticket_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Ticket` MODIFY `status` ENUM('Open', 'InProgress', 'Closed') NOT NULL DEFAULT 'Open';
