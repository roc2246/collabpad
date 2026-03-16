import test from "node:test";
import assert from "node:assert/strict";
import { comparePassword, hashPassword, toSafeUser } from "../user.js";

test("hashPassword returns a bcrypt hash and not the plaintext", async () => {
	const password = "MyS3cureP@ssw0rd";

	const passwordHash = await hashPassword(password);

	assert.notEqual(passwordHash, password);
	assert.equal(typeof passwordHash, "string");
	assert.match(passwordHash, /^\$2[aby]\$10\$/);
});

test("comparePassword returns true for matching password", async () => {
	const password = "CorrectHorseBatteryStaple";
	const passwordHash = await hashPassword(password);

	const isMatch = await comparePassword(password, passwordHash);

	assert.equal(isMatch, true);
});

test("comparePassword returns false for non-matching password", async () => {
	const passwordHash = await hashPassword("OriginalPassword");

	const isMatch = await comparePassword("WrongPassword", passwordHash);

	assert.equal(isMatch, false);
});

test("toSafeUser includes only public fields", () => {
	const now = new Date();
	const user = {
		_id: "u-1",
		name: "Riley",
		email: "riley@example.com",
		passwordHash: "secret-hash",
		role: "admin",
		createdAt: now,
		updatedAt: now,
		extra: "should-not-be-in-output",
	};

	const safeUser = toSafeUser(user);

	assert.deepEqual(safeUser, {
		id: "u-1",
		name: "Riley",
		email: "riley@example.com",
		role: "admin",
		createdAt: now,
		updatedAt: now,
	});
	assert.equal("passwordHash" in safeUser, false);
	assert.equal("extra" in safeUser, false);
});

test("toSafeUser maps _id to id without coercion", () => {
	const objectIdLike = {
		value: "abc123",
		toString() {
			return this.value;
		},
	};

	const safeUser = toSafeUser({
		_id: objectIdLike,
		name: "Test User",
		email: "test@example.com",
		role: "user",
		createdAt: undefined,
		updatedAt: undefined,
	});

	assert.equal(safeUser.id, objectIdLike);
});
