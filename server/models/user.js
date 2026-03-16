import bcrypt from "bcryptjs";

/* ---------------------------------- */
/* Password Utilities */
/* ---------------------------------- */

export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

/* ---------------------------------- */
/* Safe User Serialization */
/* ---------------------------------- */

export function toSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}