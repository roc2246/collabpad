import test from "node:test";
import assert from "node:assert/strict";
import {
	addCollaborator,
	canEditDocument,
	canViewDocument,
	idsAreEqual,
	removeCollaborator,
	transferOwnership,
	updateCollaboratorRole,
} from "../document.js";

function createDoc(overrides = {}) {
	return {
		ownerId: "owner-1",
		collaborators: [],
		...overrides,
	};
}

test("idsAreEqual returns false when either value is missing", () => {
	assert.equal(idsAreEqual(null, "a"), false);
	assert.equal(idsAreEqual("a", undefined), false);
});

test("idsAreEqual compares with object.equals when available on first value", () => {
	const left = {
		value: "abc",
		equals(other) {
			return String(other) === this.value;
		},
	};

	assert.equal(idsAreEqual(left, "abc"), true);
	assert.equal(idsAreEqual(left, "def"), false);
});

test("idsAreEqual compares with object.equals when available on second value", () => {
	const right = {
		value: "abc",
		equals(other) {
			return String(other) === this.value;
		},
	};

	assert.equal(idsAreEqual("abc", right), true);
	assert.equal(idsAreEqual("def", right), false);
});

test("idsAreEqual falls back to string comparison", () => {
	assert.equal(idsAreEqual(123, "123"), true);
	assert.equal(idsAreEqual(123, "999"), false);
});

test("canEditDocument allows owner", () => {
	const document = createDoc({ ownerId: "u-1" });
	assert.equal(canEditDocument({ id: "u-1" }, document), true);
});

test("canEditDocument allows collaborator with editor role", () => {
	const document = createDoc({
		collaborators: [{ userId: "u-2", role: "editor" }],
	});

	assert.equal(canEditDocument({ id: "u-2" }, document), true);
});

test("canEditDocument denies collaborator with viewer role", () => {
	const document = createDoc({
		collaborators: [{ userId: "u-2", role: "viewer" }],
	});

	assert.equal(canEditDocument({ id: "u-2" }, document), false);
});

test("canEditDocument denies unknown user and invalid inputs", () => {
	const document = createDoc();
	assert.equal(canEditDocument({ id: "u-9" }, document), false);
	assert.equal(canEditDocument(null, document), false);
	assert.equal(canEditDocument({ id: "u-9" }, null), false);
});

test("canViewDocument allows owner", () => {
	const document = createDoc({ ownerId: "u-1" });
	assert.equal(canViewDocument({ id: "u-1" }, document), true);
});

test("canViewDocument allows all collaborators and denies non-collaborators", () => {
	const document = createDoc({
		collaborators: [
			{ userId: "u-2", role: "viewer" },
			{ userId: "u-3", role: "editor" },
		],
	});

	assert.equal(canViewDocument({ id: "u-2" }, document), true);
	assert.equal(canViewDocument({ id: "u-3" }, document), true);
	assert.equal(canViewDocument({ id: "u-4" }, document), false);
});

test("canViewDocument denies invalid inputs", () => {
	const document = createDoc();
	assert.equal(canViewDocument(null, document), false);
	assert.equal(canViewDocument({ id: "u-1" }, null), false);
});

test("addCollaborator adds valid collaborator", () => {
	const document = createDoc();

	addCollaborator(document, "u-2", "editor");

	assert.deepEqual(document.collaborators, [{ userId: "u-2", role: "editor" }]);
});

test("addCollaborator throws when required arguments are missing", () => {
	assert.throws(() => addCollaborator(null, "u-2", "editor"), {
		message: "Document and userId are required",
	});

	assert.throws(() => addCollaborator(createDoc(), null, "editor"), {
		message: "Document and userId are required",
	});
});

test("addCollaborator throws on invalid role", () => {
	assert.throws(() => addCollaborator(createDoc(), "u-2", "owner"), {
		message: "Invalid collaborator role",
	});
});

test("addCollaborator throws when adding owner or duplicate collaborator", () => {
	const document = createDoc({
		ownerId: "u-1",
		collaborators: [{ userId: "u-2", role: "viewer" }],
	});

	assert.throws(() => addCollaborator(document, "u-1", "editor"), {
		message: "Owner cannot be added as collaborator",
	});

	assert.throws(() => addCollaborator(document, "u-2", "editor"), {
		message: "User is already a collaborator",
	});
});

test("removeCollaborator removes existing collaborator", () => {
	const document = createDoc({
		collaborators: [
			{ userId: "u-2", role: "viewer" },
			{ userId: "u-3", role: "editor" },
		],
	});

	removeCollaborator(document, "u-2");

	assert.deepEqual(document.collaborators, [{ userId: "u-3", role: "editor" }]);
});

test("removeCollaborator throws when arguments are missing or collaborator not found", () => {
	assert.throws(() => removeCollaborator(null, "u-2"), {
		message: "Document and userId are required",
	});

	assert.throws(() => removeCollaborator(createDoc(), null), {
		message: "Document and userId are required",
	});

	assert.throws(() => removeCollaborator(createDoc(), "u-9"), {
		message: "User is not a collaborator",
	});
});

test("updateCollaboratorRole changes collaborator role", () => {
	const document = createDoc({
		collaborators: [{ userId: "u-2", role: "viewer" }],
	});

	updateCollaboratorRole(document, "u-2", "editor");

	assert.deepEqual(document.collaborators, [{ userId: "u-2", role: "editor" }]);
});

test("updateCollaboratorRole throws when arguments are invalid", () => {
	assert.throws(() => updateCollaboratorRole(null, "u-2", "editor"), {
		message: "Document and userId are required",
	});

	assert.throws(() => updateCollaboratorRole(createDoc(), null, "editor"), {
		message: "Document and userId are required",
	});

	assert.throws(() => updateCollaboratorRole(createDoc(), "u-2", "owner"), {
		message: "Invalid collaborator role",
	});

	assert.throws(() => updateCollaboratorRole(createDoc(), "u-2", "editor"), {
		message: "User is not a collaborator",
	});
});

test("transferOwnership moves owner and updates collaborators correctly", () => {
	const document = createDoc({
		ownerId: "u-1",
		collaborators: [
			{ userId: "u-2", role: "viewer" },
			{ userId: "u-3", role: "editor" },
			{ userId: "u-1", role: "viewer" },
		],
	});

	transferOwnership(document, "u-2");

	assert.equal(document.ownerId, "u-2");
	assert.deepEqual(document.collaborators, [
		{ userId: "u-3", role: "editor" },
		{ userId: "u-1", role: "editor" },
	]);
});

test("transferOwnership throws when arguments are invalid", () => {
	assert.throws(() => transferOwnership(null, "u-2"), {
		message: "Document and newOwnerId are required",
	});

	assert.throws(() => transferOwnership(createDoc(), null), {
		message: "Document and newOwnerId are required",
	});
});

test("transferOwnership throws when new owner is same owner", () => {
	const document = createDoc({ ownerId: "u-1" });

	assert.throws(() => transferOwnership(document, "u-1"), {
		message: "User is already the owner",
	});
});

test("transferOwnership throws when new owner is not a collaborator", () => {
	const document = createDoc({
		ownerId: "u-1",
		collaborators: [{ userId: "u-3", role: "viewer" }],
	});

	assert.throws(() => transferOwnership(document, "u-2"), {
		message: "New owner must be a collaborator",
	});
});
