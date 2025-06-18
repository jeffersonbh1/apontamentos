import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, User, Activity, Settings, AlertTriangle, Calendar, X } from 'lucide-react';
import { mockActivities, mockEquipment, mockEmployees } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  activityId: string;
  activityName: string;
  activityType: 'setup' | 'operacao' | 'parada';
  equipmentId: string;
  equipmentName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  status: 'in_progress' | 'completed';
}

const TimeTracking: React.FC = () => {
  const { user } = useAuth();
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState<'setup' | 'operacao' | 'parada'>('operacao');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntries, setActiveEntries] = useState<TimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const activityTypes = [
    { value: 'setup', label: 'Setup', icon: Settings, color: 'text-blue-600' },
    { value: 'operacao', label: 'Operação', icon: Play, color: 'text-green-600' },
    { value: 'parada', label: 'Parada', icon: Pause, color: 'text-red-600' }
  ];

  // Update current time every second when there are active entries
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEntries.length > 0) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntries]);

  const getActivityName = (activityId: string) => {
    const activity = mockActivities.find(act => act.id === activityId);
    return activity?.title || 'Atividade não encontrada';
  };

  const getEquipmentName = (equipmentId: string) => {
    const equipment = mockEquipment.find(eq => eq.id === equipmentId);
    return equipment?.name || 'Equipamento não encontrado';
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Funcionário não encontrado';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getCurrentDuration = (startTime: Date) => {
    return Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleStartActivity = () => {
    if (!selectedActivityId || !selectedEquipmentId || !user) {
      alert('Por favor, selecione uma atividade e um equipamento');
      return;
    }

    // Check if the same equipment is already being used
    const equipmentInUse = activeEntries.some(entry => entry.equipmentId === selectedEquipmentId);
    if (equipmentInUse) {
      alert('Este equipamento já está sendo usado em outra atividade');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      employeeId: user.id,
      employeeName: `${user.firstName} ${user.lastName}`,
      activityId: selectedActivityId,
      activityName: getActivityName(selectedActivityId),
      activityType: selectedActivityType,
      equipmentId: selectedEquipmentId,
      equipmentName: getEquipmentName(selectedEquipmentId),
      startTime: new Date(),
      status: 'in_progress'
    };

    setActiveEntries(prev => [...prev, newEntry]);
    setTimeEntries(prev => [...prev, newEntry]);
    
    // Reset form
    setSelectedActivityId('');
    setSelectedEquipmentId('');
  };

  const handleFinishActivity = (entryId: string) => {
    const activeEntry = activeEntries.find(entry => entry.id === entryId);
    if (!activeEntry) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60));

    const updatedEntry: TimeEntry = {
      ...activeEntry,
      endTime,
      duration,
      status: 'completed'
    };

    // Update in timeEntries
    setTimeEntries(prev => 
      prev.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      )
    );

    // Remove from activeEntries
    setActiveEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const getActivityTypeIcon = (type: string) => {
    const activityType = activityTypes.find(at => at.value === type);
    if (!activityType) return <Activity className="w-4 h-4" />;
    const IconComponent = activityType.icon;
    return <IconComponent className={`w-4 h-4 ${activityType.color}`} />;
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'setup':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'operacao':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'parada':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get available equipment (not currently in use)
  const availableEquipment = mockEquipment.filter(equipment => 
    !activeEntries.some(entry => entry.equipmentId === equipment.id)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Apontamento de Atividades
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registre o tempo gasto em atividades e monitore o progresso
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">Horário Atual</div>
          <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Active Activities */}
      {activeEntries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Atividades em Andamento ({activeEntries.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      {getActivityTypeIcon(entry.activityType)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.activityName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeColor(entry.activityType)}`}>
                          {entry.activityType.charAt(0).toUpperCase() + entry.activityType.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFinishActivity(entry.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                    title="Finalizar Atividade"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Equipamento:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{entry.equipmentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Iniciado às:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{formatTime(entry.startTime)}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatDuration(getCurrentDuration(entry.startTime))}
                  </div>
                  <button
                    onClick={() => handleFinishActivity(entry.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mx-auto"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Finalizar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Registration Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Registrar Novo Apontamento
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">          

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equipamento * {availableEquipment.length === 0 && <span className="text-red-500">(Todos em uso)</span>}
            </label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              disabled={availableEquipment.length === 0}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <option value="">Selecione um equipamento</option>
              {availableEquipment.map(equipment => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} - {equipment.location}
                </option>
              ))}
            </select>
          </div>
          {/* Activity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Atividade *
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione uma atividade</option>
              {mockActivities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Atividade *
            </label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value as 'setup' | 'operacao' | 'parada')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          

          {/* Start Button */}
          <div className="flex items-end">
            <button
              onClick={handleStartActivity}
              disabled={!selectedActivityId || !selectedEquipmentId || availableEquipment.length === 0}
              className="w-full text-black font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors hover:opacity-90"
              style={{ backgroundColor: (!selectedActivityId || !selectedEquipmentId || availableEquipment.length === 0) ? undefined : '#D6FF27' }}
            >
              <Play className="w-4 h-4" />
              <span>Iniciar</span>
            </button>
          </div>
        </div>

        {/* Equipment Status Info */}
        {activeEntries.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Equipamentos em Uso:
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeEntries.map(entry => (
                <span
                  key={entry.id}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {entry.equipmentName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Apontamentos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {timeEntries.length} apontamentos registrados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Equipamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {timeEntries.slice().reverse().map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {entry.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.employeeName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.activityName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getActivityTypeIcon(entry.activityType)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeColor(entry.activityType)}`}>
                        {entry.activityType.charAt(0).toUpperCase() + entry.activityType.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {entry.equipmentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(entry.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {formatTime(entry.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {entry.endTime ? formatTime(entry.endTime) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {entry.status === 'in_progress' 
                      ? formatDuration(getCurrentDuration(entry.startTime))
                      : entry.duration 
                      ? formatDuration(entry.duration)
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {entry.status === 'in_progress' ? 'Em Andamento' : 'Finalizado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {timeEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum apontamento registrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Inicie o registro de uma atividade para ver o histórico aqui
            </p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {timeEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Total</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {timeEntries.filter(entry => entry.activityType === 'operacao').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Operações</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {timeEntries.filter(entry => entry.activityType === 'setup').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Setups</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Pause className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {timeEntries.filter(entry => entry.activityType === 'parada').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Paradas</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;