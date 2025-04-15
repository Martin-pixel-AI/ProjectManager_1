'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertError } from '@/components/ui/AlertError';
import { Project, Task, User } from '@/utils/types';

export default function NewTaskPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const parentTaskId = searchParams.get('parentTask');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [reviewedById, setReviewedById] = useState('');
  
  const [project, setProject] = useState<Project | null>(null);
  const [parentTask, setParentTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setStartDate(formatDate(today));
    setDueDate(formatDate(tomorrow));
  }, []);

  // Load project, parent task, and members data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        // Fetch project details
        const projectResponse = await axios.get(`/api/projects/${projectId}`);
        setProject(projectResponse.data);
        
        // Fetch members (project owner and members)
        const membersArray = [projectResponse.data.owner, ...projectResponse.data.members];
        setMembers(membersArray);
        
        // If parent task ID is provided, fetch parent task details
        if (parentTaskId) {
          const parentTaskResponse = await axios.get(`/api/tasks/${parentTaskId}`);
          setParentTask(parentTaskResponse.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
        console.error('New task page error:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (isAuthenticated && !isLoading && projectId) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, projectId, parentTaskId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Название задачи обязательно';
      isValid = false;
    }

    if (!startDate) {
      newErrors.startDate = 'Дата начала обязательна';
      isValid = false;
    }

    if (!dueDate) {
      newErrors.dueDate = 'Дата завершения обязательна';
      isValid = false;
    } else if (new Date(dueDate) < new Date(startDate)) {
      newErrors.dueDate = 'Дата завершения должна быть позже даты начала';
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
      setError(null);
      
      await axios.post('/api/tasks', {
        title,
        description,
        project: projectId,
        parentTask: parentTaskId || null,
        assignedTo: assignedToId || undefined,
        reviewedBy: reviewedById || undefined,
        priority,
        status,
        startDate: new Date(startDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
      });
      
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
      console.error('Create task error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || initialLoading) {
    return (
      <div className="flex justify-center my-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link href={`/projects/${projectId}`} className="text-indigo-600 hover:text-indigo-900 mr-2">
          &larr; Назад к проекту
        </Link>
        <h1 className="text-2xl font-bold ml-4">
          {parentTask 
            ? `Новая подзадача для "${parentTask.title}"` 
            : 'Новая задача'}
        </h1>
      </div>
      
      {error && <AlertError message={error} onClose={() => setError(null)} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название задачи*
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Введите название задачи"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                placeholder="Введите описание задачи"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress' | 'completed')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pending">В ожидании</option>
                <option value="in_progress">В процессе</option>
                <option value="completed">Завершена</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата начала*
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full p-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата завершения*
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full p-2 border rounded-md ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ответственный
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Не назначен</option>
                {members.map((member: any) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Проверяющий
              </label>
              <select
                value={reviewedById}
                onChange={(e) => setReviewedById(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Не назначен</option>
                {members.map((member: any) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-2">
              <Link href={`/projects/${projectId}`}>
                <Button variant="outline" type="button">
                  Отмена
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Создание...
                  </>
                ) : 'Создать задачу'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 