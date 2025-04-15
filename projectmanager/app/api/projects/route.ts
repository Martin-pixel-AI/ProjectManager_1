import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all projects
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: { $in: [userId] } }
      ]
    }).populate('owner', 'name email').populate('members', 'name email');
    
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get projects' },
      { status: 500 }
    );
  }
}

// Create a new project
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    const { name, description, startDate, endDate, color, members } = await req.json();
    
    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Project name, start date, and end date are required' },
        { status: 400 }
      );
    }
    
    // Create project
    const project = await Project.create({
      name,
      description: description || '',
      startDate,
      endDate,
      color: color || '#4F46E5',
      owner: userId,
      members: members || []
    });
    
    // Populate owner and members references
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
} 