import mongoose from "mongoose";

const { Schema } = mongoose;

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

const Document = mongoose.model("Document", documentSchema);

export { VALID_COLLABORATOR_ROLES, collaboratorSchema, documentSchema };
export default Document;