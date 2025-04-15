'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Settings } from '@/utils/types';
import { AlertError } from '@/components/ui/AlertError';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/settings');
        setSettings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load settings');
        console.error('Settings error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && !isLoading) {
      fetchSettings();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setSettings({
        ...settings,
        [name]: checkbox.checked,
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      
      await axios.put('/api/settings', settings);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
      console.error('Save settings error:', err);
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      {error && <AlertError message={error} onClose={() => setError(null)} />}
      
      {saveSuccess && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
          Settings saved successfully!
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Interface</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Theme
                </label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              
              <div className="flex items-center">
                <input
                  id="notifications"
                  name="notificationsEnabled"
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                  Enable notifications
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Project Colors
                </label>
                <div className="flex space-x-2 mt-2">
                  {settings.colorPalette?.projectColors?.map((color, index) => (
                    <div
                      key={index}
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Task Priority Colors
                </label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <span className="text-sm text-gray-500">Low</span>
                    <div
                      className="h-8 w-full rounded mt-1"
                      style={{ backgroundColor: settings.colorPalette?.taskColors?.low }}
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Medium</span>
                    <div
                      className="h-8 w-full rounded mt-1"
                      style={{ backgroundColor: settings.colorPalette?.taskColors?.medium }}
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">High</span>
                    <div
                      className="h-8 w-full rounded mt-1"
                      style={{ backgroundColor: settings.colorPalette?.taskColors?.high }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 