import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { withAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';

// Get all projects
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get user from request (added by middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
    
    // Get user from request (added by middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
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
    
    // Create project
    const project = await Project.create({
      name,
      description: description || '',
      owner: userId,
      startDate,
      endDate,
      members: members || [],
      color: color || '#4F46E5',
    });
    
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

// Apply middleware to all handlers
export const GET_handler = withAuth(GET);
export const POST_handler = withAuth(POST); 