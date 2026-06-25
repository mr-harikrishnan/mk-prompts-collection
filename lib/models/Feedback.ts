import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  id: string;
  rating: number;
  reviewer: string;
  date: string;
  comment: string;
}

const FeedbackSchema = new Schema<IFeedback>({
  id: { type: String, required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewer: { type: String, required: true },
  date: { type: String, required: true },
  comment: { type: String, required: true },
});

export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
