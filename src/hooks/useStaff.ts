import { useState, useEffect, useMemo } from 'react';
import { Staff, CreateStaffRequest } from '../api/types';
import { staffApi } from '../api';

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffApi.getAllStaff();
      if (response.success) {
        // Ensure we always set an array
        const staffData = Array.isArray(response.data) ? response.data : [];
        setStaff(staffData);
      } else {
        setError(response.message || 'Failed to fetch staff');
        setStaff([]); // Set empty array on error
      }
    } catch (err) {
      setError('Failed to fetch staff');
      setStaff([]); // Set empty array on error
      console.error('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    // Ensure staff is an array before filtering
    if (!Array.isArray(staff)) {
      console.warn('Staff data is not an array:', staff);
      return [];
    }
    
    return staff.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      
      // Convert role number to string for filtering
      const roleNames = ['manager', 'receptionist', 'housekeeping', 'maintenance', 'security', 'concierge', 'kitchen', 'cleaning'];
      const roleName = roleNames[member.role] || 'unknown';
      const matchesRole = roleFilter === 'all' || roleName === roleFilter;
      
      return matchesSearch && matchesRole && (member.isActive !== false);
    });
  }, [staff, searchTerm, roleFilter]);

  const createStaff = async (staffData: CreateStaffRequest) => {
    try {
      const response = await staffApi.createStaff(staffData);
      if (response.success) {
        setStaff(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create staff member');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to create staff member');
      console.error('Create staff error:', err);
      return { success: false, error: 'Failed to create staff member' };
    }
  };

  const updateStaff = async (staffId: string, updates: Partial<Staff>) => {
    try {
      const response = await staffApi.updateStaff(staffId, updates);
      if (response.success) {
        setStaff(prev => prev.map(member => 
          member.id === staffId ? response.data : member
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update staff member');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to update staff member');
      console.error('Update staff error:', err);
      return { success: false, error: 'Failed to update staff member' };
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      const response = await staffApi.deleteStaff(staffId);
      if (response.success) {
        setStaff(prev => prev.filter(member => member.id !== staffId));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete staff member');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError('Failed to delete staff member');
      console.error('Delete staff error:', err);
      return { success: false, error: 'Failed to delete staff member' };
    }
  };

  const getStaffByRole = async (role: string) => {
    try {
      const response = await staffApi.getStaffByRole(role);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Get staff by role error:', err);
      return { success: false, error: 'Failed to get staff by role' };
    }
  };

  const searchStaff = async (query: string) => {
    try {
      const response = await staffApi.searchStaff(query);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Search staff error:', err);
      return { success: false, error: 'Failed to search staff' };
    }
  };

  const getRoleColor = (role: number) => {
    const roleNames = ['manager', 'receptionist', 'housekeeping', 'maintenance', 'security', 'concierge', 'kitchen', 'cleaning'];
    const roleName = roleNames[role] || 'unknown';
    
    const colors = {
      manager: 'bg-purple-100 text-purple-800',
      receptionist: 'bg-blue-100 text-blue-800',
      housekeeping: 'bg-green-100 text-green-800',
      maintenance: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800',
      concierge: 'bg-indigo-100 text-indigo-800',
      kitchen: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-teal-100 text-teal-800'
    };
    return colors[roleName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleName = (role: number) => {
    const roleNames = ['Manager', 'Receptionist', 'Housekeeping', 'Maintenance', 'Security', 'Concierge', 'Kitchen Staff', 'Cleaning Staff'];
    return roleNames[role] || 'Unknown';
  };

  const getShiftColor = (shift: string) => {
    const colors = {
      morning: 'bg-yellow-100 text-yellow-800',
      evening: 'bg-blue-100 text-blue-800',
      night: 'bg-purple-100 text-purple-800'
    };
    return colors[shift as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStaffStats = () => {
    return {
      total: staff.length,
      active: staff.filter(s => s.isActive !== false).length,
      managers: staff.filter(s => s.role === 0).length,
      receptionists: staff.filter(s => s.role === 1).length,
      housekeeping: staff.filter(s => s.role === 2).length,
      maintenance: staff.filter(s => s.role === 3).length
    };
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff: filteredStaff,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffByRole,
    searchStaff,
    getRoleColor,
    getRoleName,
    getShiftColor,
    getStaffStats,
    refetch: fetchStaff
  };
};
