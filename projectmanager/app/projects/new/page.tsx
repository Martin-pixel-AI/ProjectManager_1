'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

const COLORS = [
  '#4F46E5', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [users, setUsers] = useState<Array<{ id: string, name: string, email: string }>>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Set default dates
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(twoWeeksLater.toISOString().split('T')[0]);

    // Fetch users for member selection
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        const response = await axios.get('/api/users');
        // Filter out current user
        const filteredUsers = response.data.filter(
          (u: { id: string }) => u.id !== user.id
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setFetchingUsers(false);
      }
    };
    
    fetchUsers();
  }, [user, router]);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      startDate?: string;
      endDate?: string;
    } = {};
    let isValid = true;

    if (!name) {
      newErrors.name = 'Project name is required';
      isValid = false;
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
      isValid = false;
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      await axios.post('/api/projects', {
        name,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        members: selectedMembers,
        color,
      });
      
      router.push('/projects');
    } catch (err: any) {
      setErrors({
        ...errors,
        general: err.response?.data?.message || 'Failed to create project',
      });
      console.error('Create project error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          <Input
            id="name"
            name="name"
            label="Project Name"
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter project description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="startDate"
              name="startDate"
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
              required
            />

            <Input
              id="endDate"
              name="endDate"
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.endDate}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Project Color
            </label>
            <div className="flex space-x-3">
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Team Members
            </label>
            
            {fetchingUsers ? (
              <div className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-500">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">No users available to add as members</p>
            ) : (
              <div className="border rounded-md p-3 max-h-48 overflow-auto">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`user-${u.id}`}
                      checked={selectedMembers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, u.id]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== u.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`user-${u.id}`} className="ml-2 block text-sm text-gray-900">
                      {u.name} ({u.email})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Link href="/projects">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 