import React, { useState } from 'react';
import { Plus, Search, Activity, Clock, CheckCircle, Play, Pause, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { mockActivities, mockEquipment } from '../../data/mockData';
import { Activity as ActivityType } from '../../types';

const Activities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState(mockActivities);
  const [newActivity, setNewActivity] = useState({
    name: '',
    equipmentId: '',
    description: ''
  });

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEquipmentName = (equipmentId?: string) => {
    if (!equipmentId) return 'No equipment';
    const equipment = mockEquipment.find(eq => eq.id === equipmentId);
    return equipment?.name || 'Unknown Equipment';
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'in_progress':
        return <Play className={`${iconClass} text-blue-500`} />;
      case 'pending':
        return <Clock className={`${iconClass} text-yellow-500`} />;
      case 'cancelled':
        return <Pause className={`${iconClass} text-red-500`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newActivity.name.trim() || !newActivity.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const activity: ActivityType = {
      id: Date.now().toString(),
      title: newActivity.name,
      description: newActivity.description,
      type: 'production',
      status: 'pending',
      priority: 'medium',
      assignedTo: ['1'], // Default to current user
      equipmentId: newActivity.equipmentId || undefined,
      companyId: '1',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      progress: 0,
      estimatedHours: 8
    };

    setActivities(prev => [...prev, activity]);
    setNewActivity({ name: '', equipmentId: '', description: '' });
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Activity Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Register new activities and manage existing ones
          </p>
        </div>
      </div>

      {/* Activity Registration Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Register New Activity
        </h2>
        
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="activityName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Name *
              </label>
              <input
                type="text"
                id="activityName"
                value={newActivity.name}
                onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter activity name"
                required
              />
            </div>

            <div>
              <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Equipment
              </label>
              <select
                id="equipment"
                value={newActivity.equipmentId}
                onChange={(e) => setNewActivity(prev => ({ ...prev, equipmentId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select equipment (optional)</option>
                {mockEquipment.map(equipment => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name} - {equipment.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={newActivity.description}
              onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              placeholder="Enter detailed description of the activity"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="text-black font-semibold px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors hover:opacity-90"
              style={{ backgroundColor: '#D6FF27' }}
            >
              <Plus className="w-5 h-5" />
              <span>Register Activity</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Registered Activities
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredActivities.length} activities found
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {activity.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4" />
                        <span>{getEquipmentName(activity.equipmentId)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Created {formatDate(activity.startDate)}</span>
                      </div>
                      {activity.actualHours && (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{activity.actualHours}h worked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Activity</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No activities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria' : 'Register your first activity above'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;