import mongoose from "mongoose";

const { Schema } = mongoose;

/* ---------------------------------- */
/* Collaborator Schema */
/* ---------------------------------- */

const VALID_COLLABORATOR_ROLES = ["editor", "viewer"];

const collaboratorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: VALID_COLLABORATOR_ROLES,
      default: "viewer",
      required: true,
    },
  },
  { _id: false }
);

/* ---------------------------------- */
/* Document Schema */
/* ---------------------------------- */

const documentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collaborators: {
      type: [collaboratorSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ "collaborators.userId": 1 });

/* ---------------------------------- */
/* User Schema */
/* ---------------------------------- */

const VALID_USER_ROLES = ["user", "admin"];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: VALID_USER_ROLES,
      default: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------------------------- */
/* Models */
/* ---------------------------------- */

const Document = mongoose.model("Document", documentSchema);
const User = mongoose.model("User", userSchema);

/* ---------------------------------- */
/* Exports */
/* ---------------------------------- */

export {
  VALID_COLLABORATOR_ROLES,
  VALID_USER_ROLES,
  collaboratorSchema,
  documentSchema,
  userSchema,
};

export { Document, User };

export default {
  Document,
  User,
};