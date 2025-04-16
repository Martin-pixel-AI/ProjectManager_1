'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Project, Task } from '@/src/utils/types';
import { AlertError } from '@/components/ui/AlertError';
import { formatDate } from '@/src/utils/helpers';

export default function BoardPage() {
  // Состояние проектов и задач
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние боковой панели редактирования задачи
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('low');
  
  const taskPanelRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем проекты
        const response = await axios.get('/api/projects');
        setProjects(response.data);
        
        // Получаем задачи для каждого проекта
        const tasksObj: Record<string, Task[]> = {};
        
        for (const project of response.data) {
          const tasksResponse = await axios.get(`/api/tasks?projectId=${project._id}`);
          tasksObj[project._id] = tasksResponse.data;
        }
        
        setProjectTasks(tasksObj);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить данные');
        console.error('Ошибка загрузки проектов и задач:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && !isLoading) {
      fetchProjects();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Обработка клика по задаче
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setIsTaskPanelOpen(true);
  };
  
  // Закрытие панели задачи
  const closeTaskPanel = () => {
    setIsTaskPanelOpen(false);
    setTimeout(() => setSelectedTask(null), 300); // После анимации закрытия
  };
  
  // Обработка клика вне панели для её закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taskPanelRef.current && !taskPanelRef.current.contains(event.target as Node)) {
        closeTaskPanel();
      }
    };
    
    if (isTaskPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTaskPanelOpen]);
  
  // Обновление задачи
  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    
    try {
      const updatedTask = {
        ...selectedTask,
        status: taskStatus,
        priority: taskPriority
      };
      
      await axios.put(`/api/tasks/${selectedTask._id}`, updatedTask);
      
      // Обновляем задачу в локальном состоянии
      setProjectTasks(prev => {
        const projectId = typeof selectedTask.project === 'string' 
          ? selectedTask.project 
          : selectedTask.project._id;
          
        const updatedTasks = prev[projectId].map(task => 
          task._id === selectedTask._id ? {...task, status: taskStatus, priority: taskPriority} : task
        );
        
        return {
          ...prev,
          [projectId]: updatedTasks
        };
      });
      
      closeTaskPanel();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось обновить задачу');
      console.error('Ошибка обновления задачи:', err);
    }
  };

  // Получение задач по статусу для проекта
  const getTasksByStatus = (projectId: string, status: 'pending' | 'in_progress' | 'completed') => {
    if (!projectTasks[projectId]) return [];
    return projectTasks[projectId].filter(task => task.status === status);
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
    <div className="relative min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Доска</h1>
        <Link href="/projects/new">
          <Button>Создать новый проект</Button>
        </Link>
      </div>
      
      {error && <AlertError message={error} onClose={() => setError(null)} />}
      
      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Проекты не найдены</h2>
          <p className="text-gray-500 mb-6">Начните с создания вашего первого проекта.</p>
          <Link href="/projects/new">
            <Button>Создать проект</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max pb-6">
            {projects.map((project) => (
              <div key={project._id} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <h2 className="text-xl font-bold">{project.name}</h2>
                  </div>
                  <Link href={`/projects/${project._id}`}>
                    <Button variant="outline" size="sm">Детали проекта</Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Колонка задач "В ожидании" */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">В ожидании</h3>
                      <Link href={`/projects/${project._id}/new-task`}>
                        <Button size="sm" variant="ghost">+</Button>
                      </Link>
                    </div>
                    
                    {getTasksByStatus(project._id, 'pending').length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Нет задач</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getTasksByStatus(project._id, 'pending').map((task) => (
                          <div 
                            key={task._id} 
                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                            onClick={() => handleTaskClick(task)}
                          >
                            <h4 className="font-medium mb-2">{task.title}</h4>
                            <div className="flex justify-between items-center text-xs">
                              <span 
                                className={`px-2 py-1 rounded-full ${
                                  task.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {task.priority === 'high' 
                                  ? 'Высокий' 
                                  : task.priority === 'medium'
                                  ? 'Средний'
                                  : 'Низкий'}
                              </span>
                              <span className="text-gray-500">
                                {formatDate(task.dueDate, 'd MMM')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Колонка задач "В процессе" */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">В процессе</h3>
                    </div>
                    
                    {getTasksByStatus(project._id, 'in_progress').length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Нет задач</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getTasksByStatus(project._id, 'in_progress').map((task) => (
                          <div 
                            key={task._id} 
                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                            onClick={() => handleTaskClick(task)}
                          >
                            <h4 className="font-medium mb-2">{task.title}</h4>
                            <div className="flex justify-between items-center text-xs">
                              <span 
                                className={`px-2 py-1 rounded-full ${
                                  task.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {task.priority === 'high' 
                                  ? 'Высокий' 
                                  : task.priority === 'medium'
                                  ? 'Средний'
                                  : 'Низкий'}
                              </span>
                              <span className="text-gray-500">
                                {formatDate(task.dueDate, 'd MMM')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Колонка задач "Завершено" */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Завершено</h3>
                    </div>
                    
                    {getTasksByStatus(project._id, 'completed').length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Нет задач</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getTasksByStatus(project._id, 'completed').map((task) => (
                          <div 
                            key={task._id} 
                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                            onClick={() => handleTaskClick(task)}
                          >
                            <h4 className="font-medium mb-2">{task.title}</h4>
                            <div className="flex justify-between items-center text-xs">
                              <span 
                                className={`px-2 py-1 rounded-full ${
                                  task.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {task.priority === 'high' 
                                  ? 'Высокий' 
                                  : task.priority === 'medium'
                                  ? 'Средний'
                                  : 'Низкий'}
                              </span>
                              <span className="text-gray-500">
                                {formatDate(task.dueDate, 'd MMM')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Боковая панель редактирования задачи */}
      <div 
        className={`fixed inset-y-0 right-0 bg-white shadow-xl w-96 transition-transform duration-300 transform ${
          isTaskPanelOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
        ref={taskPanelRef}
      >
        {selectedTask && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Задача {selectedTask.title}</h2>
                <button 
                  onClick={closeTaskPanel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">{selectedTask.description || 'Нет описания'}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-2 text-sm rounded-md ${
                        taskStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTaskStatus('pending')}
                    >
                      В ожидании
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md ${
                        taskStatus === 'in_progress' 
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-400' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTaskStatus('in_progress')}
                    >
                      В процессе
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md ${
                        taskStatus === 'completed' 
                          ? 'bg-green-100 text-green-800 border-2 border-green-400' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTaskStatus('completed')}
                    >
                      Завершено
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-2 text-sm rounded-md ${
                        taskPriority === 'low' 
                          ? 'bg-green-100 text-green-800 border-2 border-green-400' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTaskPriority('low')}
                    >
                      Низкий
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md ${
                        taskPriority === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTaskPriority('medium')}
                    >
                      Средний
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md ${
                        taskPriority === 'high' 
                          ? 'bg-red-100 text-red-800 border-2 border-red-400' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setTaskPriority('high')}
                    >
                      Высокий
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Срок выполнения</label>
                  <p className="text-gray-800">{formatDate(selectedTask.dueDate)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Исполнитель</label>
                  <p className="text-gray-800">
                    {selectedTask.assignedTo 
                      ? selectedTask.assignedTo.name 
                      : 'Не назначен'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="p-6 border-t flex justify-between">
              <Link href={`/tasks/${selectedTask._id}/edit`}>
                <Button variant="outline">Редактировать</Button>
              </Link>
              <Button onClick={handleUpdateTask}>Сохранить</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 