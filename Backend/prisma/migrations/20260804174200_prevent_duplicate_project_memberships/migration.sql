-- Keep one row for each project/user pair before enforcing uniqueness.
DELETE duplicateMembership
FROM `ProjectMember` AS duplicateMembership
INNER JOIN `ProjectMember` AS membershipToKeep
  ON duplicateMembership.`projectId` = membershipToKeep.`projectId`
  AND duplicateMembership.`userId` = membershipToKeep.`userId`
  AND duplicateMembership.`id` > membershipToKeep.`id`;

-- Prevent the same user from being added to a project more than once.
CREATE UNIQUE INDEX `ProjectMember_projectId_userId_key`
ON `ProjectMember`(`projectId`, `userId`);
