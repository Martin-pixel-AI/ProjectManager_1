import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
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
    
    // Find project
    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user is owner or member
    const isOwner = project.owner._id.toString() === userId;
    const isMember = project.members.some(
      (member: any) => member._id.toString() === userId
    );
    
    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have access to this project' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get project' },
      { status: 500 }
    );
  }
}

// Update a project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
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
    
    // Find project
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the owner
    if (project.owner.toString() !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Only the project owner can update it' },
        { status: 403 }
      );
    }
    
    const { name, description, startDate, endDate, members, color } = await req.json();
    
    // Validate input
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }
    
    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description: description || '',
        startDate,
        endDate,
        members: members || [],
        color: color || project.color,
      },
      { new: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
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
    
    // Find project
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the owner
    if (project.owner.toString() !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Only the project owner can delete it' },
        { status: 403 }
      );
    }
    
    // Delete all tasks associated with the project
    const Task = mongoose.models.Task;
    if (Task) {
      await Task.deleteMany({ project: id });
    }
    
    // Delete project
    await Project.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Project and all associated tasks deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
} 