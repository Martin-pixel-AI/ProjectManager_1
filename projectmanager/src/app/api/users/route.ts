import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { withAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';

// Get all users (for project member selection)
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
    
    // Get users without password field
    const users = await User.find().select('name email -_id');
    
    // Map to more friendly format
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email
    }));
    
    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}

// Apply middleware to the handler
export const GET_handler = withAuth(GET); 