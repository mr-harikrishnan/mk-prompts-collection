import mongoose, { Schema, Document } from "mongoose";

export interface IMetrics extends Document {
  totalVisits: number;
  totalCopies: number;
  copiesHistory: Array<{
    date: string;
    promptTitle: string;
    category: string;
  }>;
  retentionCohort: Array<{
    week: string;
    percentage: number;
  }>;
}

const CopyRecordSchema = new Schema({
  date: { type: String, required: true },
  promptTitle: { type: String, required: true },
  category: { type: String, required: true },
});

const RetentionCohortSchema = new Schema({
  week: { type: String, required: true },
  percentage: { type: Number, required: true },
});

const MetricsSchema = new Schema<IMetrics>({
  totalVisits: { type: Number, default: 0 },
  totalCopies: { type: Number, default: 0 },
  copiesHistory: [CopyRecordSchema],
  retentionCohort: [RetentionCohortSchema],
});

export default mongoose.models.Metrics || mongoose.model<IMetrics>("Metrics", MetricsSchema);
