'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertError } from '@/components/ui/AlertError';
import { Task } from '@/utils/types';
import { formatDate } from '@/utils/helpers';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/tasks/${taskId}`);
        setTask(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load task');
        console.error('Task error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && !isLoading && taskId) {
      fetchTask();
    }
  }, [isAuthenticated, isLoading, taskId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      router.push(`/projects/${task?.project}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      console.error('Delete task error:', err);
    }
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
    <div className="container mx-auto py-8 px-4">
      {error && <AlertError message={error} onClose={() => setError(null)} />}
      
      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : task ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">{task.title}</h1>
                <div className="mt-1">
                  <span 
                    className={`px-2 py-1 text-xs rounded-full 
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
                  <span 
                    className={`ml-2 px-2 py-1 text-xs rounded-full 
                      ${task.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : task.priority === 'medium' 
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'}`}
                  >
                    {task.priority === 'high' 
                      ? 'Высокий приоритет' 
                      : task.priority === 'medium' 
                      ? 'Средний приоритет' 
                      : 'Низкий приоритет'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href={`/tasks/${task._id}/edit`}>
                  <Button variant="outline">Редактировать</Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Детали задачи</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Проект:</span>
                    <p>
                      <Link href={`/projects/${typeof task.project === 'string' ? task.project : task.project._id}`} className="text-indigo-600 hover:text-indigo-800">
                        {typeof task.project === 'string' ? task.project : task.project.name}
                      </Link>
                    </p>
                  </div>
                  
                  {task.parentTask && (
                    <div>
                      <span className="text-gray-500 text-sm">Родительская задача:</span>
                      <p>
                        <Link href={`/tasks/${typeof task.parentTask === 'string' ? task.parentTask : task.parentTask._id}`} className="text-indigo-600 hover:text-indigo-800">
                          {typeof task.parentTask === 'string' ? task.parentTask : task.parentTask.title}
                        </Link>
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500 text-sm">Дата начала:</span>
                    <p>{formatDate(task.startDate)}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Срок выполнения:</span>
                    <p>{formatDate(task.dueDate)}</p>
                  </div>
                  
                  {task.completedAt && (
                    <div>
                      <span className="text-gray-500 text-sm">Дата завершения:</span>
                      <p>{formatDate(task.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2">Назначение</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Исполнитель:</span>
                    <p>{task.assignedTo ? task.assignedTo.name : 'Не назначен'}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Проверяющий:</span>
                    <p>{task.reviewedBy ? task.reviewedBy.name : 'Не назначен'}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Создана:</span>
                    <p>{formatDate(task.createdAt)}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Последнее обновление:</span>
                    <p>{formatDate(task.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Описание</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
              {task.description || 'Описание отсутствует'}
            </div>
          </div>
          
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Подзадачи ({task.subTasks.length})</h2>
                <Link href={`/projects/${typeof task.project === 'string' ? task.project : task.project._id}/new-task?parentTask=${task._id}`}>
                  <Button variant="outline" size="sm">Добавить подзадачу</Button>
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Приоритет
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Исполнитель
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {task.subTasks.map((subtask) => (
                      <tr key={subtask._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subtask.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 py-1 text-xs rounded-full 
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 py-1 text-xs rounded-full 
                              ${subtask.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : subtask.priority === 'medium' 
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'}`}
                          >
                            {subtask.priority === 'high' 
                              ? 'Высокий' 
                              : subtask.priority === 'medium' 
                              ? 'Средний' 
                              : 'Низкий'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subtask.assignedTo ? subtask.assignedTo.name : 'Не назначен'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(subtask.dueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/tasks/${subtask._id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Просмотр
                          </Link>
                          <Link 
                            href={`/tasks/${subtask._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Изменить
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Задача не найдена</h2>
          <p className="text-gray-500 mb-6">Задача не существует или у вас нет к ней доступа.</p>
          <Link href="/projects">
            <Button>Вернуться к списку проектов</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 