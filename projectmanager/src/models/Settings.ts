import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface ISettings extends Document {
  user: Types.ObjectId | IUser;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ru';
  notificationsEnabled: boolean;
  colorPalette: {
    projectColors: string[];
    taskColors: { [key: string]: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      enum: ['en', 'ru'],
      default: 'en',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    colorPalette: {
      projectColors: {
        type: [String],
        default: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'],
      },
      taskColors: {
        type: Map,
        of: String,
        default: {
          low: '#10B981',     // Green for low priority
          medium: '#F59E0B',  // Amber for medium priority
          high: '#EF4444',    // Red for high priority
        },
      },
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema); 