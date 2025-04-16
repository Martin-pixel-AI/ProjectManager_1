'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertError } from '@/components/ui/AlertError';
import { Project, Task } from '@/src/utils/types';
import { GanttChart } from '@/components/GanttChart';
import { formatDate } from '@/src/utils/helpers';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch projects
        const projectsResponse = await axios.get('/api/projects');
        setProjects(projectsResponse.data);
        
        // Set first project as selected if any
        if (projectsResponse.data.length > 0) {
          setSelectedProject(projectsResponse.data[0]._id);
          
          // Fetch tasks for the first project
          const tasksResponse = await axios.get(`/api/tasks?projectId=${projectsResponse.data[0]._id}`);
          setTasks(tasksResponse.data);
          
          // Initialize expanded state for all tasks
          const initialExpandedState: Record<string, boolean> = {};
          tasksResponse.data.forEach((task: Task) => {
            initialExpandedState[task._id] = false;
          });
          setExpandedTasks(initialExpandedState);
        }
        
        // Fetch recent tasks assigned to user
        const recentTasksResponse = await axios.get('/api/tasks', {
          params: {
            assignedTo: 'me',
            limit: 5,
          },
        });
        setRecentTasks(recentTasksResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading]);
  
  const handleProjectSelect = async (projectId: string) => {
    setSelectedProject(projectId);
    try {
      setLoading(true);
      // Fetch tasks for the selected project
      const tasksResponse = await axios.get(`/api/tasks?projectId=${projectId}`);
      setTasks(tasksResponse.data);
      
      // Initialize expanded state for all tasks
      const initialExpandedState: Record<string, boolean> = {};
      tasksResponse.data.forEach((task: Task) => {
        initialExpandedState[task._id] = false;
      });
      setExpandedTasks(initialExpandedState);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project tasks');
      console.error('Project tasks error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Get current selected project
  const currentProject = projects.find(p => p._id === selectedProject);
  
  // Get root tasks (tasks without parent)
  const rootTasks = tasks.filter(task => !task.parentTask);
  
  // Get subtasks for a given task
  const getSubtasks = (taskId: string) => {
    return tasks.filter(task => 
      typeof task.parentTask === 'string' 
        ? task.parentTask === taskId
        : task.parentTask?._id === taskId
    );
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Рабочий стол</h1>
        <p className="text-gray-600">Добро пожаловать, {user?.name}!</p>
      </div>

      {error && <AlertError message={error} onClose={() => setError(null)} />}

      {loading && !currentProject ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Project Selection */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <button
                  key={project._id}
                  onClick={() => handleProjectSelect(project._id)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedProject === project._id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {project.name}
                </button>
              ))}
              <Link href="/projects/new">
                <button className="px-4 py-2 rounded-full bg-green-500 text-white text-sm">
                  + Новый проект
                </button>
              </Link>
            </div>
          </div>
          
          {/* Project Details and Gantt Chart */}
          {currentProject ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Card */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div 
                    className="w-full h-2 mb-4 rounded" 
                    style={{ backgroundColor: currentProject.color }}
                  ></div>
                  
                  <h2 className="text-xl font-bold mb-2">{currentProject.name}</h2>
                  <p className="text-gray-600 mb-4">{currentProject.description || 'Описание отсутствует'}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-gray-500 text-sm">Дата начала:</p>
                      <p className="font-medium">{formatDate(currentProject.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Дата окончания:</p>
                      <p className="font-medium">{formatDate(currentProject.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Владелец:</p>
                      <p className="font-medium">{currentProject.owner.name}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Участники проекта:</h3>
                    <div className="space-y-2">
                      {currentProject.members.map((member) => (
                        <div key={member.id} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                            {member.name.substring(0, 1).toUpperCase()}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      ))}
                      {currentProject.members.length === 0 && (
                        <p className="text-sm text-gray-500">Нет участников</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link href={`/projects/${currentProject._id}`}>
                      <Button className="w-full">Открыть проект</Button>
                    </Link>
                  </div>
                </div>
                
                {/* Tasks List */}
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Задачи проекта</h2>
                    <Link href={`/projects/${currentProject._id}/new-task`}>
                      <Button size="sm">Добавить задачу</Button>
                    </Link>
                  </div>
                  
                  {rootTasks.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">В этом проекте пока нет задач</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rootTasks.map((task) => (
                        <div key={task._id} className="border rounded-lg overflow-hidden">
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
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
                                <span className="font-medium">{task.title}</span>
                                <span 
                                  className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full 
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
                            <Link href={`/tasks/${task._id}`}>
                              <span className="text-indigo-600 hover:text-indigo-900 text-sm">Просмотр</span>
                            </Link>
                          </div>
                          
                          {/* Subtasks */}
                          {expandedTasks[task._id] && (
                            <div className="bg-gray-50 p-3">
                              {getSubtasks(task._id).length > 0 ? (
                                <div className="space-y-2">
                                  {getSubtasks(task._id).map((subtask) => (
                                    <div key={subtask._id} className="flex items-center justify-between p-2 border rounded bg-white">
                                      <div>
                                        <span className="text-sm">{subtask.title}</span>
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
                                      <Link href={`/tasks/${subtask._id}`}>
                                        <span className="text-indigo-600 hover:text-indigo-900 text-xs">Просмотр</span>
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-2">
                                  <p className="text-sm text-gray-500">Нет подзадач</p>
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
              
              {/* Gantt Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md h-full">
                  <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
                  {rootTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Добавьте задачи, чтобы увидеть диаграмму Ганта</p>
                    </div>
                  ) : (
                    <div className="h-[500px] overflow-auto">
                      <GanttChart 
                        project={currentProject} 
                        tasks={tasks} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">У вас пока нет проектов</h2>
              <p className="text-gray-500 mb-6">Создайте свой первый проект, чтобы начать работу</p>
              <Link href="/projects/new">
                <Button>Создать проект</Button>
              </Link>
            </div>
          )}
          
          {/* Recent Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ваши задачи</h2>
              <Link href="/tasks">
                <Button variant="outline" size="sm">Все задачи</Button>
              </Link>
            </div>
            
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">У вас нет назначенных задач</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTasks.map((task) => (
                  <Link 
                    href={`/tasks/${task._id}`} 
                    key={task._id}
                    className="block p-4 border rounded-md hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' 
                            ? 'Высокий' 
                            : task.priority === 'medium'
                            ? 'Средний'
                            : 'Низкий'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Срок: {formatDate(task.dueDate)}
                      </p>
                      <div className="mt-2 text-xs inline-block px-2 py-1 rounded-full bg-gray-100">
                        {task.status === 'pending' 
                          ? 'В ожидании' 
                          : task.status === 'in_progress' 
                          ? 'В процессе' 
                          : 'Завершена'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 