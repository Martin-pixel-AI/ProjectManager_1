'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Project } from '@/utils/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/projects');
        setProjects(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load projects');
        console.error('Projects error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md my-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
          <Link href="/projects/new">
            <Button>Create Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              href={`/projects/${project._id}`} 
              key={project._id}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div 
                className="h-2" 
                style={{ backgroundColor: project.color }}
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <div>
                    <p>Start: {new Date(project.startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(project.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p>Owner: {project.owner.name}</p>
                    <p>{project.members.length} members</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 