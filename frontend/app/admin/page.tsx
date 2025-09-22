'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/auth';
import { useApi } from '@/hooks/use-api';

// Define the allowed roles as a type union
type UserRole = 'user' | 'manager' | 'admin';

// Define form data interface with proper types
interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

// Interface for creating users (includes password)
interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

// Interface for updating users (password is optional and separate)
interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string; // Optional for updates
}

function AdminContent() {
  const { data: users, loading, execute, setData } = useApi<User[]>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    execute(() => apiClient.getUsers());
  }, [execute]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const createData: CreateUserData = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      role: formData.role,
    };
    
    const response = await apiClient.createUser(createData);
    
    if (response.success) {
      setShowCreateForm(false);
      setFormData({ email: '', name: '', password: '', role: 'user' });
      // Refresh users list
      execute(() => apiClient.getUsers());
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const response = await apiClient.deleteUser(id);
      
      if (response.success) {
        // Remove user from local state
        setData(prev => prev?.filter(user => user.id !== id) || null);
      }
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Create update payload with proper typing
    const updateData: UpdateUserData = {
      email: formData.email,
      name: formData.name,
      role: formData.role,
    };

    // Only include password if it's not empty (for updates)
    if (formData.password.trim()) {
      updateData.password = formData.password;
    }

    const response = await apiClient.updateUser(editingUser.id, updateData);
    
    if (response.success) {
      setEditingUser(null);
      setFormData({ email: '', name: '', password: '', role: 'user' });
      // Refresh users list
      execute(() => apiClient.getUsers());
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
    });
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    setFormData({ email: '', name: '', password: '', role: 'user' });
  };

  // Handle role change with proper typing
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setFormData(prev => ({ ...prev, role }));
  };

  if (loading && !users) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New User
            </button>
          </div>

          {/* Create/Edit User Modal */}
          {(showCreateForm || editingUser) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
                
                <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          email: e.target.value 
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          name: e.target.value 
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password {editingUser && '(leave blank to keep current)'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          password: e.target.value 
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required={!editingUser}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={handleRoleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingUser ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {users && users.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'manager'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium focus:outline-none focus:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium focus:outline-none focus:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No users found. Click "Add New User" to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  );
}