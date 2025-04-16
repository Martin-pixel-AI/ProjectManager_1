'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Project, Task } from '@/src/utils/types';
import { formatDate } from '@/src/utils/helpers';

interface GanttChartProps {
  project: Project;
  tasks: Task[];
}

export function GanttChart({ project, tasks }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState<number>(40); // pixels per day
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Calculate project duration in days
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  const projectDuration = Math.max(
    1,
    Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
  );
  
  // Set up timeline dates
  const timelineDates: Date[] = [];
  const currentDate = new Date(projectStart);
  
  for (let i = 0; i <= projectDuration; i++) {
    timelineDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate the total width of the gantt chart
  const totalWidth = timelineDates.length * timeScale;
  
  // Generate task bars
  const taskBars = tasks.map(task => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.dueDate);
    
    const offset = Math.floor((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) * timeScale;
    const width = Math.max(
      timeScale, // Minimum width of 1 day
      Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) * timeScale
    );
    
    // Determine task color based on status
    let barColor = '#FCD34D'; // Yellow for pending
    if (task.status === 'in_progress') {
      barColor = '#60A5FA'; // Blue for in progress
    } else if (task.status === 'completed') {
      barColor = '#34D399'; // Green for completed
    }
    
    // Determine tasks with parents (subtasks)
    const isSubtask = task.parentTask !== undefined && task.parentTask !== null;
    
    return {
      task,
      offset,
      width,
      barColor,
      isSubtask
    };
  });
  
  // Handle zooming
  const handleZoomIn = () => {
    setTimeScale(prev => Math.min(100, prev + 10));
  };
  
  const handleZoomOut = () => {
    setTimeScale(prev => Math.max(20, prev - 10));
  };
  
  // Sync scroll state
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      setScrollLeft(container.scrollLeft);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {formatDate(project.startDate)} — {formatDate(project.endDate)}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative border-b border-gray-200 overflow-hidden">
        <div 
          className="flex h-10" 
          style={{ width: totalWidth + 'px', transform: `translateX(-${scrollLeft}px)` }}
        >
          {timelineDates.map((date, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center border-r border-gray-200"
              style={{ width: `${timeScale}px`, minWidth: `${timeScale}px` }}
            >
              <span className="text-xs text-gray-500">
                {date.getDate()}
              </span>
              <span className="text-xs text-gray-400">
                {date.toLocaleString('default', { month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Gantt Chart */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto"
      >
        <div 
          className="relative"
          style={{ width: totalWidth + 'px', minHeight: '100%' }}
        >
          {/* Vertical grid lines */}
          {timelineDates.map((date, index) => (
            <div 
              key={index}
              className="absolute top-0 bottom-0 border-r border-gray-100"
              style={{ left: `${index * timeScale}px`, width: `${timeScale}px` }}
            ></div>
          ))}
          
          {/* Today's line */}
          {(() => {
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - projectStart.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (today >= projectStart && today <= projectEnd) {
              return (
                <div 
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                  style={{ left: `${diffDays * timeScale}px` }}
                ></div>
              );
            }
            return null;
          })()}
          
          {/* Task bars */}
          <div className="pt-2">
            {taskBars.map(({ task, offset, width, barColor, isSubtask }) => (
              <div 
                key={task._id}
                className="relative h-10 mb-2 group"
                style={{ marginLeft: isSubtask ? '20px' : '0' }}
              >
                {/* Task bar */}
                <div
                  className="absolute h-7 rounded-sm flex items-center px-2 cursor-pointer transition-opacity hover:opacity-90"
                  style={{ 
                    left: `${offset}px`, 
                    width: `${width}px`,
                    backgroundColor: barColor,
                  }}
                  title={`${task.title} (${formatDate(task.startDate)} - ${formatDate(task.dueDate)})`}
                >
                  <span className="text-xs text-white truncate">
                    {task.title}
                  </span>
                </div>
                
                {/* Task info tooltip */}
                <div className="absolute left-0 bottom-full mb-2 bg-white p-2 rounded shadow-lg z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(task.startDate)} - {formatDate(task.dueDate)}
                  </p>
                  <p className="text-xs mt-1">
                    <span 
                      className={`inline-block px-1.5 py-0.5 rounded-full 
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
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 