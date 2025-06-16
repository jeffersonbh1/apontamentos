import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, CheckCircle, Activity, AlertTriangle } from 'lucide-react';
import { mockActivities, mockEquipment } from '../../data/mockData';
import { Activity as ActivityType } from '../../types';

interface TimeEntry {
  id: string;
  activityId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}

const TimeTracking: React.FC = () => {
  const [activities] = useState(mockActivities);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second when there's an active entry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEntry) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntry]);

  const getEquipmentName = (equipmentId?: string) => {
    if (!equipmentId) return 'No equipment';
    const equipment = mockEquipment.find(eq => eq.id === equipmentId);
    return equipment?.name || 'Unknown Equipment';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentDuration = () => {
    if (!activeEntry) return 0;
    return Math.floor((currentTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60));
  };

  const handleStartActivity = () => {
    if (!selectedActivityId) {
      alert('Please select an activity first');
      return;
    }

    if (activeEntry) {
      alert('Please finish the current activity before starting a new one');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      activityId: selectedActivityId,
      startTime: new Date()
    };

    setActiveEntry(newEntry);
    setTimeEntries(prev => [...prev, newEntry]);
  };

  const handleFinishActivity = () => {
    if (!activeEntry) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60));

    const updatedEntry = {
      ...activeEntry,
      endTime,
      duration
    };

    setTimeEntries(prev => 
      prev.map(entry => 
        entry.id === activeEntry.id ? updatedEntry : entry
      )
    );

    setActiveEntry(null);
  };

  const getActivityById = (id: string) => {
    return activities.find(activity => activity.id === id);
  };

  const getTotalTimeForActivity = (activityId: string) => {
    return timeEntries
      .filter(entry => entry.activityId === activityId && entry.duration)
      .reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Time Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track time spent on activities and monitor progress
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Time</div>
          <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Active Timer */}
      {activeEntry && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getActivityById(activeEntry.activityId)?.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Started at {formatTime(activeEntry.startTime)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatDuration(getCurrentDuration())}
              </div>
              <button
                onClick={handleFinishActivity}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Finish Activity</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Start New Activity
        </h2>
        
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label htmlFor="activitySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Activity
            </label>
            <select
              id="activitySelect"
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={!!activeEntry}
            >
              <option value="">Choose an activity to track</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.title} - {getEquipmentName(activity.equipmentId)}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleStartActivity}
            disabled={!!activeEntry || !selectedActivityId}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Start Activity</span>
          </button>
        </div>

        {selectedActivityId && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {getActivityById(selectedActivityId)?.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getActivityById(selectedActivityId)?.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Equipment: {getEquipmentName(getActivityById(selectedActivityId)?.equipmentId)}</span>
                  <span>Total time logged: {formatDuration(getTotalTimeForActivity(selectedActivityId))}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Entries History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Time Entries History
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {timeEntries.length} entries recorded
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {timeEntries.slice().reverse().map((entry) => {
            const activity = getActivityById(entry.activityId);
            const isActive = entry.id === activeEntry?.id;
            
            return (
              <div key={entry.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : entry.endTime 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {isActive ? (
                        <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : entry.endTime ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activity?.title || 'Unknown Activity'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getEquipmentName(activity?.equipmentId)}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(entry.startTime)}</span>
                        <span>{formatTime(entry.startTime)}</span>
                        {entry.endTime && (
                          <>
                            <span>→</span>
                            <span>{formatTime(entry.endTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-mono font-semibold ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {isActive 
                        ? formatDuration(getCurrentDuration())
                        : entry.duration 
                        ? formatDuration(entry.duration)
                        : '0h 0m'
                      }
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isActive ? 'In Progress' : 'Completed'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {timeEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No time entries yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start tracking time on activities to see your history here
            </p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {timeEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Time Logged</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {timeEntries.filter(entry => entry.endTime).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed Sessions</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(timeEntries.map(entry => entry.activityId)).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Activities Tracked</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;