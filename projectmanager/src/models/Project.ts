import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
  name: string;
  description: string;
  owner: Types.ObjectId | IUser;
  startDate: Date;
  endDate: Date;
  members: Types.Array<Types.ObjectId | IUser>;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Project start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Project end date is required'],
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    color: {
      type: String,
      default: '#4F46E5', // Default indigo color
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 