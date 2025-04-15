import { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: User;
  startDate: string;
  endDate: string;
  members: User[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string | Project;
  assignedTo?: User;
  reviewedBy?: User;
  parentTask?: string | Task;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  startDate: string;
  dueDate: string;
  completedAt?: string;
  subTasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  user: string | User;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ru';
  notificationsEnabled: boolean;
  colorPalette: {
    projectColors: string[];
    taskColors: Record<string, string>;
  };
} 