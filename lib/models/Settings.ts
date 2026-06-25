import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  pageName: string;
  instagramUsername: string;
  instagramLink: string;
  followersText: string;
  accessKey: string;
}

const SettingsSchema = new Schema<ISettings>({
  pageName: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  instagramLink: { type: String, required: true },
  followersText: { type: String, required: true },
  accessKey: { type: String, required: true },
});

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
