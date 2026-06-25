import mongoose, { Schema, Document } from "mongoose";

export interface IPrompt extends Document {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  template: string;
  image: string;
  variables: Array<{
    name: string;
    label: string;
    defaultValue: string;
  }>;
  tags: string[];
  copyCount: number;
  stars: number;
  totalReviews: number;
  createdAt: Date;
  promptKey?: string;
}

const PromptVariableSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  defaultValue: { type: String, required: true },
});

const PromptSchema = new Schema<IPrompt>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  shortDesc: { type: String, required: true },
  longDesc: { type: String, required: true },
  template: { type: String, required: true },
  image: { type: String, required: true },
  variables: [PromptVariableSchema],
  tags: [{ type: String }],
  copyCount: { type: Number, default: 0 },
  stars: { type: Number, default: 5.0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  promptKey: { type: String, unique: true, sparse: true },
});

export default mongoose.models.Prompt || mongoose.model<IPrompt>("Prompt", PromptSchema);
