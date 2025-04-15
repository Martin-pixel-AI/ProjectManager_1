import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

// Указываем, что этот маршрут должен быть динамическим, поскольку использует headers
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function GET(req: Request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    await connectDB();
    
    // Get user data from database without password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
} 