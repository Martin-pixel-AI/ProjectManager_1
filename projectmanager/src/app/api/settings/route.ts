import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { withAuth } from '@/utils/authMiddleware';
import { NextRequest } from 'next/server';

// Get settings for current user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find settings for user
    let settings = await Settings.findOne({ user: userId });
    
    // Create default settings if not found
    if (!settings) {
      settings = await Settings.create({
        user: userId,
        theme: 'system',
        language: 'en',
        notificationsEnabled: true,
        colorPalette: {
          projectColors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'],
          taskColors: {
            low: '#10B981',
            medium: '#F59E0B',
            high: '#EF4444',
          },
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// Update settings for current user
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { theme, language, notificationsEnabled, colorPalette } = await req.json();
    
    // Find settings for user
    let settings = await Settings.findOne({ user: userId });
    
    // Create default settings if not found
    if (!settings) {
      settings = await Settings.create({
        user: userId,
        theme: theme || 'system',
        language: language || 'en',
        notificationsEnabled: notificationsEnabled ?? true,
        colorPalette: colorPalette || {
          projectColors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'],
          taskColors: {
            low: '#10B981',
            medium: '#F59E0B',
            high: '#EF4444',
          },
        },
      });
    } else {
      // Update existing settings
      const updateData: any = {};
      
      if (theme) updateData.theme = theme;
      if (language) updateData.language = language;
      if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
      
      if (colorPalette) {
        if (colorPalette.projectColors) updateData['colorPalette.projectColors'] = colorPalette.projectColors;
        if (colorPalette.taskColors) updateData['colorPalette.taskColors'] = colorPalette.taskColors;
      }
      
      settings = await Settings.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true }
      );
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Apply middleware to all handlers
export const GET_handler = withAuth(GET);
export const PUT_handler = withAuth(PUT); 