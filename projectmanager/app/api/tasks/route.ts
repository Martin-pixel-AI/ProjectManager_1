import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { withAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { Types } from 'mongoose';

// Get all tasks or filtered by project
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const parentTaskId = url.searchParams.get('parentTaskId');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const assignedTo = url.searchParams.get('assignedTo');
    
    // Build query
    const query: any = {};
    
    if (projectId) {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return NextResponse.json(
          { message: 'Invalid project ID' },
          { status: 400 }
        );
      }
      
      // Check if user has access to the project
      const project = await Project.findById(projectId);
      if (!project) {
        return NextResponse.json(
          { message: 'Project not found' },
          { status: 404 }
        );
      }
      
      const isOwner = project.owner.toString() === userId;
      const isMember = project.members.some(
        (memberId: Types.ObjectId) => memberId.toString() === userId
      );
      
      if (!isOwner && !isMember) {
        return NextResponse.json(
          { message: 'Unauthorized: You do not have access to this project' },
          { status: 403 }
        );
      }
      
      query.project = projectId;
    } else {
      // If no project specified, get tasks from all projects the user has access to
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { members: { $in: [userId] } }
        ]
      });
      
      const projectIds = projects.map((project) => project._id);
      query.project = { $in: projectIds };
    }
    
    // Add other filters
    if (parentTaskId === 'null') {
      query.parentTask = null; // Root tasks only
    } else if (parentTaskId) {
      query.parentTask = parentTaskId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo === 'me' ? userId : assignedTo;
    }
    
    // Get tasks
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');
    
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get tasks' },
      { status: 500 }
    );
  }
}

// Create a new task
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const {
      title,
      description,
      project: projectId,
      parentTask,
      assignedTo,
      reviewedBy,
      priority,
      status,
      startDate,
      dueDate
    } = await req.json();
    
    // Validate required fields
    if (!title || !projectId || !startDate || !dueDate) {
      return NextResponse.json(
        { message: 'Title, project, start date, and due date are required' },
        { status: 400 }
      );
    }
    
    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
        { status: 400 }
      );
    }
    
    // Check if user has access to the project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId: Types.ObjectId) => memberId.toString() === userId
    );
    
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have access to this project' },
        { status: 403 }
      );
    }
    
    // Create task
    const taskData: any = {
      title,
      description: description || '',
      project: projectId,
      startDate,
      dueDate,
      priority: priority || 'medium',
      status: status || 'pending'
    };
    
    // Add optional fields if provided
    if (parentTask) taskData.parentTask = parentTask;
    if (assignedTo) taskData.assignedTo = assignedTo;
    if (reviewedBy) taskData.reviewedBy = reviewedBy;
    
    const task = await Task.create(taskData);
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('parentTask', 'title');
    
    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

// Apply middleware to all handlers
export const GET_handler = withAuth(GET);
export const POST_handler = withAuth(POST); 