import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { withAdminAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';

// Get all users with additional statistics for admin
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get all users (excluding password)
    const users = await User.find().select('-password');
    
    // For each user, get their project and task counts
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectsCount = await Project.countDocuments({ owner: user._id });
        const tasksCount = await Task.countDocuments({ assignedTo: user._id });
        
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          projectsCount,
          tasksCount
        };
      })
    );
    
    return NextResponse.json(usersWithStats);
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get users data' },
      { status: 500 }
    );
  }
}

// Create a new user (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password, role } = await req.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Apply middleware to the handlers
export const GET_handler = withAdminAuth(GET);
export const POST_handler = withAdminAuth(POST); 