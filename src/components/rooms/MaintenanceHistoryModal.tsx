import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, AlertCircle, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { Room } from '../../api/types';
import { getApiUrl } from '../../config/api';

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}

interface MaintenanceRecord {
  id: number;
  date: string;
  status: number;
  roomId: number;
  description: string;
  notes: string;
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
  updatedAt: string;
  roomNumber: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: MaintenanceRecord[];
  statusCode: number;
  timestamp: string;
}

const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({ isOpen, onClose, room }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (room && isOpen) {
      fetchMaintenanceHistory();
    }
  }, [room, isOpen]);

  const fetchMaintenanceHistory = async () => {
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl(`MaintenanceDate/room/${room.id}`));
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.success) {
          // Filter to show only future maintenance dates
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          
          const futureRecords = data.data.filter(record => {
            const maintenanceDate = new Date(record.date);
            return maintenanceDate >= today;
          });

          // Sort by date (earliest first)
          futureRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setMaintenanceRecords(futureRecords);
        } else {
          setError(data.message || 'Failed to fetch maintenance history');
        }
      } else {
        setError('Failed to fetch maintenance history');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Maintenance history fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1:
        return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 2:
        return { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Wrench };
      case 3:
        return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 4:
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Maintenance History</h2>
              <p className="text-sm text-gray-600">Room {room.number} - Upcoming Maintenance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading maintenance history...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading History</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchMaintenanceHistory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : maintenanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Maintenance</h3>
              <p className="text-gray-600">There are no scheduled maintenance tasks for Room {room.number}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Showing {maintenanceRecords.length} upcoming maintenance task{maintenanceRecords.length !== 1 ? 's' : ''} for Room {room.number}
                  </span>
                </div>
              </div>

              {maintenanceRecords.map((record) => {
                const statusInfo = getStatusInfo(record.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <StatusIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{record.description}</h3>
                          <p className="text-sm text-gray-600">ID: {record.id}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Scheduled:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(record.createdAt)}</span>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">Notes:</span>
                            <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {record.completedAt && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Completed:</span>
                          <span className="text-sm text-green-700">{formatDate(record.completedAt)}</span>
                          {record.completedBy && (
                            <>
                              <span className="text-sm text-green-600">by</span>
                              <span className="text-sm font-medium text-green-800">{record.completedBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryModal;
