'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  projectsCount: number;
  tasksCount: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch admin dashboard stats
        const statsResponse = await axios.get('/api/admin/stats');
        setStats(statsResponse.data);
        
        // Fetch users with additional info
        const usersResponse = await axios.get('/api/admin/users');
        setUsers(usersResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load admin data');
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!isLoading) {
      if (isAuthenticated && user?.role === 'admin') {
        fetchData();
      } else if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md my-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">Users</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats?.totalUsers}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">Projects</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats?.totalProjects}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.activeProjects} active
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">Tasks</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats?.totalTasks}</p>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <p>{stats?.completedTasks} completed</p>
                <p>{stats?.pendingTasks} pending</p>
              </div>
            </div>
          </div>
          
          {/* User Management */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button>Add New User</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.projectsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.tasksCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* System Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Backup Database</h3>
                <Button>Create Backup</Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">System Maintenance</h3>
                <Button variant="outline">Clear Cache</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 