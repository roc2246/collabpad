import { VALID_COLLABORATOR_ROLES } from "./schema.js";

function idsAreEqual(a, b) {
  if (!a || !b) return false;

  if (typeof a.equals === "function") {
    return a.equals(b);
  }

  if (typeof b.equals === "function") {
    return b.equals(a);
  }

  return String(a) === String(b);
}

export function canEditDocument(user, document) {
  if (!user || !document) {
    return false;
  }

  if (idsAreEqual(document.ownerId, user.id)) {
    return true;
  }

  const collaborator = document.collaborators.find((c) =>
    idsAreEqual(c.userId, user.id)
  );

  return !!(collaborator && collaborator.role === "editor");
}

export function canViewDocument(user, document) {
  if (!user || !document) {
    return false;
  }

  if (idsAreEqual(document.ownerId, user.id)) {
    return true;
  }

  const collaborator = document.collaborators.find((c) =>
    idsAreEqual(c.userId, user.id)
  );

  return !!collaborator;
}

export function addCollaborator(document, userId, role) {
  if (!document || !userId) {
    throw new Error("Document and userId are required");
  }

  if (!VALID_COLLABORATOR_ROLES.includes(role)) {
    throw new Error("Invalid collaborator role");
  }

  if (idsAreEqual(document.ownerId, userId)) {
    throw new Error("Owner cannot be added as collaborator");
  }

  const existingCollaborator = document.collaborators.find((c) =>
    idsAreEqual(c.userId, userId)
  );

  if (existingCollaborator) {
    throw new Error("User is already a collaborator");
  }

  document.collaborators.push({ userId, role });
}

export function removeCollaborator(document, userId) {
  if (!document || !userId) {
    throw new Error("Document and userId are required");
  }

  const index = document.collaborators.findIndex((c) =>
    idsAreEqual(c.userId, userId)
  );

  if (index === -1) {
    throw new Error("User is not a collaborator");
  }

  document.collaborators.splice(index, 1);
}

export function updateCollaboratorRole(document, userId, newRole) {
  if (!document || !userId) {
    throw new Error("Document and userId are required");
  }

  if (!VALID_COLLABORATOR_ROLES.includes(newRole)) {
    throw new Error("Invalid collaborator role");
  }

  const collaborator = document.collaborators.find((c) =>
    idsAreEqual(c.userId, userId)
  );

  if (!collaborator) {
    throw new Error("User is not a collaborator");
  }

  collaborator.role = newRole;
}

export function transferOwnership(document, newOwnerId) {
  if (!document || !newOwnerId) {
    throw new Error("Document and newOwnerId are required");
  }

  if (idsAreEqual(document.ownerId, newOwnerId)) {
    throw new Error("User is already the owner");
  }

  const existingCollaborator = document.collaborators.find((c) =>
    idsAreEqual(c.userId, newOwnerId)
  );

  if (!existingCollaborator) {
    throw new Error("New owner must be a collaborator");
  }

  const previousOwnerId = document.ownerId;

  document.collaborators = document.collaborators.filter(
    (c) =>
      !idsAreEqual(c.userId, newOwnerId) &&
      !idsAreEqual(c.userId, previousOwnerId)
  );

  document.collaborators.push({
    userId: previousOwnerId,
    role: "editor",
  });

  document.ownerId = newOwnerId;
}

export { idsAreEqual };