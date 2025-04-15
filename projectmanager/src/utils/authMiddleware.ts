import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
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
      
      // Attach user to request for handler to use
      const requestWithUser = Object.assign(req, { user: decoded });
      
      return handler(requestWithUser);
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { message: error.message || 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

export function withAdminAuth(handler: Function) {
  return async (req: NextRequest) => {
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
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { message: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }
      
      // Attach user to request for handler to use
      const requestWithUser = Object.assign(req, { user: decoded });
      
      return handler(requestWithUser);
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      console.error('Admin auth middleware error:', error);
      return NextResponse.json(
        { message: error.message || 'Authentication failed' },
        { status: 500 }
      );
    }
  };
} 