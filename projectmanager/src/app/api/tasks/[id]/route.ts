import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { withAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

// Get a specific task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid task ID' },
        { status: 400 }
      );
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find task with populated references
    const task = await Task.findById(id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('parentTask', 'title');
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the associated project
    const project = await Project.findById(task.project);
    if (!project) {
      return NextResponse.json(
        { message: 'Associated project not found' },
        { status: 404 }
      );
    }
    
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() === userId
    );
    
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have access to this task' },
        { status: 403 }
      );
    }
    
    // Get subtasks if any
    const subTasks = await Task.find({ parentTask: id })
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');
    
    // Add subtasks to response
    const taskWithSubtasks = {
      ...task.toObject(),
      subTasks
    };
    
    return NextResponse.json(taskWithSubtasks);
  } catch (error: any) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get task' },
      { status: 500 }
    );
  }
}

// Update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid task ID' },
        { status: 400 }
      );
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find task
    const task = await Task.findById(id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the associated project
    const project = await Project.findById(task.project);
    if (!project) {
      return NextResponse.json(
        { message: 'Associated project not found' },
        { status: 404 }
      );
    }
    
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() === userId
    );
    
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have access to this task' },
        { status: 403 }
      );
    }
    
    const {
      title,
      description,
      assignedTo,
      reviewedBy,
      priority,
      status,
      startDate,
      dueDate
    } = await req.json();
    
    // Update task
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = startDate;
    if (dueDate) updateData.dueDate = dueDate;
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('parentTask', 'title');
    
    // Get subtasks if any
    const subTasks = await Task.find({ parentTask: id })
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');
    
    // Add subtasks to response
    const taskWithSubtasks = {
      ...updatedTask!.toObject(),
      subTasks
    };
    
    return NextResponse.json(taskWithSubtasks);
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid task ID' },
        { status: 400 }
      );
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find task
    const task = await Task.findById(id);
    
    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the associated project
    const project = await Project.findById(task.project);
    if (!project) {
      return NextResponse.json(
        { message: 'Associated project not found' },
        { status: 404 }
      );
    }
    
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() === userId
    );
    
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have access to this task' },
        { status: 403 }
      );
    }
    
    // Delete task and its subtasks
    await Task.deleteMany({ parentTask: id });
    await Task.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Task and all subtasks deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}

// Apply middleware to all handlers
export const GET_handler = withAuth(GET);
export const PUT_handler = withAuth(PUT);
export const DELETE_handler = withAuth(DELETE); 