'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertError } from '@/components/ui/AlertError';
import { Project, Task } from '@/utils/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rootTasks, setRootTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch project details
        const projectResponse = await axios.get(`/api/projects/${projectId}`);
        setProject(projectResponse.data);
        
        // Fetch project tasks
        const tasksResponse = await axios.get('/api/tasks', {
          params: { projectId, parentTaskId: 'null' },
        });
        
        // Set root tasks (no parent)
        setRootTasks(tasksResponse.data);
        
        // Initialize expanded state for all root tasks
        const initialExpandedState: Record<string, boolean> = {};
        tasksResponse.data.forEach((task: Task) => {
          initialExpandedState[task._id] = false;
        });
        setExpandedTasks(initialExpandedState);
        
        // Fetch all tasks for the project for reference
        const allTasksResponse = await axios.get('/api/tasks', {
          params: { projectId },
        });
        setTasks(allTasksResponse.data);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project data');
        console.error('Project detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && !isLoading && projectId) {
      fetchProjectData();
    }
  }, [isAuthenticated, isLoading, projectId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Get subtasks for a given task
  const getSubtasks = (taskId: string) => {
    return tasks.filter(task => task.parentTask === taskId);
  };

  if (isLoading) {
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
      {error && <AlertError message={error} onClose={() => setError(null)} />}
      
      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : project ? (
        <div className="space-y-6">
          {/* Верхняя панель проекта */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Карточка проекта (слева) */}
            <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit">
              <h1 className="text-xl font-bold mb-4">Карточка проекта</h1>
              
              <div 
                className="w-full h-2 mb-4 rounded" 
                style={{ backgroundColor: project.color }}
              ></div>
              
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-gray-600 mt-2">{project.description || 'Описание отсутствует'}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Дата начала:</p>
                  <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Дата окончания:</p>
                  <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Владелец:</p>
                  <p className="font-medium">{project.owner.name}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Участники проекта:</h3>
                <div className="space-y-2">
                  {project.members.map((member: any) => (
                    <div key={member._id} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      <span>{member.name}</span>
                    </div>
                  ))}
                  {project.members.length === 0 && (
                    <p className="text-sm text-gray-500">Нет участников</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <Link href={`/projects/${project._id}/edit`}>
                  <Button variant="outline" className="w-full mb-2">Редактировать проект</Button>
                </Link>
                <Link href={`/projects/${project._id}/new-task`}>
                  <Button className="w-full">Создать задачу</Button>
                </Link>
              </div>
            </div>
            
            {/* Панель задач (справа) */}
            <div className="w-full md:w-3/4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Задачи</h2>
                  <Link href={`/projects/${project._id}/new-task`}>
                    <Button size="sm">Добавить задачу</Button>
                  </Link>
                </div>
                
                {rootTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">В этом проекте пока нет задач</p>
                    <Link href={`/projects/${project._id}/new-task`}>
                      <Button>Создать первую задачу</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Задачи верхнего уровня */}
                    {rootTasks.map((task) => (
                      <div key={task._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b"
                          onClick={() => toggleTaskExpand(task._id)}
                        >
                          <div className="flex items-center">
                            <div className="mr-2">
                              <svg 
                                className={`h-4 w-4 transition-transform ${expandedTasks[task._id] ? 'transform rotate-90' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium block">Задача {task.title}</span>
                              <span 
                                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full 
                                  ${task.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.status === 'in_progress' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'}`}
                              >
                                {task.status === 'pending' 
                                  ? 'В ожидании' 
                                  : task.status === 'in_progress' 
                                  ? 'В процессе' 
                                  : 'Завершена'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Link href={`/tasks/${task._id}`}>
                              <span className="text-indigo-600 hover:text-indigo-900 text-sm mr-2">Просмотр</span>
                            </Link>
                            <Link href={`/tasks/${task._id}/edit`}>
                              <span className="text-indigo-600 hover:text-indigo-900 text-sm">Изменить</span>
                            </Link>
                          </div>
                        </div>
                        
                        {/* Подзадачи */}
                        {expandedTasks[task._id] && (
                          <div className="bg-gray-50 p-3">
                            {getSubtasks(task._id).length > 0 ? (
                              <div className="space-y-2">
                                {getSubtasks(task._id).map((subtask) => (
                                  <div key={subtask._id} className="flex items-center justify-between p-2 border rounded bg-white">
                                    <div>
                                      <span className="text-sm">подзадача {subtask.title}</span>
                                      <span 
                                        className={`ml-2 px-1.5 py-0.5 text-xs rounded-full 
                                          ${subtask.status === 'completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : subtask.status === 'in_progress' 
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'}`}
                                      >
                                        {subtask.status === 'pending' 
                                          ? 'В ожидании' 
                                          : subtask.status === 'in_progress' 
                                          ? 'В процессе' 
                                          : 'Завершена'}
                                      </span>
                                    </div>
                                    <div>
                                      <Link href={`/tasks/${subtask._id}`}>
                                        <span className="text-indigo-600 hover:text-indigo-900 text-xs mr-2">Просмотр</span>
                                      </Link>
                                      <Link href={`/tasks/${subtask._id}/edit`}>
                                        <span className="text-indigo-600 hover:text-indigo-900 text-xs">Изменить</span>
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-2">
                                <p className="text-sm text-gray-500">Нет подзадач</p>
                                <Link href={`/projects/${project._id}/new-task?parentTask=${task._id}`}>
                                  <span className="text-indigo-600 hover:text-indigo-900 text-sm">+ Добавить подзадачу</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Проект не найден</h2>
          <p className="text-gray-500 mb-6">Проект не существует или у вас нет к нему доступа.</p>
          <Link href="/projects">
            <Button>Вернуться к списку проектов</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 