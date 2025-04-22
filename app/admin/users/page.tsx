// app/admin/users/page.tsx
import { checkUserRole } from '@/lib/roleCheck';
import prisma from '@/lib/prisma';

import { useState } from 'react';

function RoleSelector({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  
  const updateRole = async () => {
    if (role === currentRole) return;
    
    setIsUpdating(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole: role }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      
      setMessage('Role updated successfully');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="role-selector">
      <select 
        value={role} 
        onChange={(e) => setRole(e.target.value)}
        disabled={isUpdating}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
      </select>
      
      <button 
        onClick={updateRole}
        disabled={isUpdating || role === currentRole}
      >
        {isUpdating ? 'Updating...' : 'Update'}
      </button>
      
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default async function UserManagementPage() {
  // Verify the user is an admin
  await checkUserRole(['admin']);
  
  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      auth_type: true,
      created_at: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });
  
  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      <div className="info-box">
        <p><strong>Note:</strong> New registrations (email or Google OAuth) are automatically assigned the "user" role. 
        As an admin, you can promote users to other roles as needed.</p>
      </div>
      
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Auth Type</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name || 'N/A'}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.auth_type}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <RoleSelector userId={user.id} currentRole={user.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}