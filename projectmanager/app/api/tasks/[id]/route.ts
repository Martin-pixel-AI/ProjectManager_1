import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
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
    
    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
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
    
    // Build update data
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (reviewedBy !== undefined) updateData.reviewedBy = reviewedBy || null;
    if (priority) updateData.priority = priority;
    if (status) {
      updateData.status = status;
      
      // If status changed to completed, set completedAt
      if (status === 'completed' && task.status !== 'completed') {
        updateData.completedAt = new Date();
      } else if (status !== 'completed') {
        updateData.completedAt = null;
      }
    }
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
    
    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
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