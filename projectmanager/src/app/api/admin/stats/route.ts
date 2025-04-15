import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { withAdminAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';

// Get admin dashboard statistics
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    
    // Get active projects (not completed)
    const now = new Date();
    const activeProjects = await Project.countDocuments({
      endDate: { $gte: now }
    });
    
    // Get task stats by status
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
    
    // Compile stats
    const stats = {
      totalUsers,
      totalProjects,
      totalTasks,
      activeProjects,
      completedTasks,
      pendingTasks,
      inProgressTasks
    };
    
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get admin statistics' },
      { status: 500 }
    );
  }
}

// Apply middleware to the handler
export const GET_handler = withAdminAuth(GET); 