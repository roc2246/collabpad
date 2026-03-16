export function canEditDocument(user, document) {
  // Check if user owns the document
  if (document.ownerId === user.id) {
    return true;
  }

  // Find collaborator entry
  const collaborator = document.collaborators.find(
    (c) => c.userId === user.id
  );

  // Check if collaborator has edit permission
  if (collaborator && collaborator.role === "editor") {
    return true;
  }

  return false;
}

export function addCollaborator(document, userId, role) {
  const validRoles = ["editor", "viewer"];

  if (!validRoles.includes(role)) {
    throw new Error("Invalid collaborator role");
  }

  if (document.ownerId === userId) {
    throw new Error("Owner cannot be added as collaborator");
  }

  const existingCollaborator = document.collaborators.find(
    (c) => c.userId === userId
  );

  if (existingCollaborator) {
    throw new Error("User is already a collaborator");
  }

  document.collaborators.push({ userId, role });
}

export function removeCollaborator(document, userId) {
  const index = document.collaborators.findIndex((c) => c.userId === userId);

  if (index === -1) {
    throw new Error("User is not a collaborator");
  }

  document.collaborators.splice(index, 1);
}

export function canViewDocument(user, document) {
  // Check if user owns the document
  if (document.ownerId === user.id) {
    return true;
  }

  // Find collaborator entry
  const collaborator = document.collaborators.find(
    (c) => c.userId === user.id
  );

  // Check if collaborator has view permission
  if (collaborator && (collaborator.role === "editor" || collaborator.role === "viewer")) {
    return true;
  }

  return false;
}

export function updateCollaboratorRole(document, userId, newRole) {
  const validRoles = ["editor", "viewer"];

  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid collaborator role");
  }

  const collaborator = document.collaborators.find((c) => c.userId === userId);

  if (!collaborator) {
    throw new Error("User is not a collaborator");
  }

  collaborator.role = newRole;
}

export function transferOwnership(document, newOwnerId) {
  if (document.ownerId === newOwnerId) {
    throw new Error("User is already the owner");
  }

  const existingCollaborator = document.collaborators.find(
    (c) => c.userId === newOwnerId
  );

  if (!existingCollaborator) {
    throw new Error("New owner must be a collaborator");
  }

  // Remove the new owner from collaborators
  document.collaborators = document.collaborators.filter(
    (c) => c.userId !== newOwnerId
  );

  // Add the current owner as a collaborator with editor role
  document.collaborators.push({ userId: document.ownerId, role: "editor" });

  // Transfer ownership
  document.ownerId = newOwnerId;
}