'use client';

import React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const { user, isAuthenticated } = useCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h1 className="text-4xl font-bold text-center mb-6">
        Welcome to Project Manager
      </h1>
      <p className="text-xl text-center text-gray-600 mb-8 max-w-2xl">
        A comprehensive platform for managing projects, tasks, and deadlines with visual Gantt charts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl w-full">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Project Management</h2>
          <p className="text-gray-600 mb-4">
            Create and organize projects with detailed information, assign team members, and track progress.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Task Tracking</h2>
          <p className="text-gray-600 mb-4">
            Break down projects into tasks and subtasks, assign responsibilities, set priorities, and monitor status.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Visual Timeline</h2>
          <p className="text-gray-600 mb-4">
            View your project timeline with interactive Gantt charts to easily visualize deadlines and dependencies.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
} 