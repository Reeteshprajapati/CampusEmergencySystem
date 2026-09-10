import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/FormControls';
import { Pagination } from '../../components/ui/Pagination';
import { Users, UserPlus, Trash2, Edit, UserCheck, UserX } from 'lucide-react';

export const UsersPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // User Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'SECURITY_OFFICER',
    status: 'ACTIVE',
    password: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ page, size: 10 });
      const pageData = res?.data || res;
      setUsers(pageData?.content || (Array.isArray(pageData) ? pageData : []));
      setTotalPages(pageData?.totalPages || 0);
    } catch (err) {
      showToast(err.toString(), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', phone: '', role: 'SECURITY_OFFICER', status: 'ACTIVE', password: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({ fullName: u.fullName, email: u.email, phone: u.phone, role: u.role, status: u.status || 'ACTIVE', password: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password.trim(),
    };
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
        showToast('User details updated successfully', 'success');
      } else {
        await userService.createUser(payload);
        const passText = payload.password ? payload.password : 'CampusGuard@123';
        showToast(`User account created! Login Email: ${payload.email} | Password: ${passText}`, 'success');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this user account?`)) return;
    try {
      await userService.toggleUserStatus(id, newStatus);
      showToast(`User account ${actionLabel}d successfully`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage student accounts, security officers, and administrators.</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={handleOpenCreate}>
          Create User Account
        </Button>
      </div>

      <Card className="p-0 border-slate-200">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Phone</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{u.fullName}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="px-4 py-3.5 text-slate-600">{u.phone}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="role">{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" icon={Edit} onClick={() => handleOpenEdit(u)}>
                            Edit
                          </Button>
                          {u.status === 'ACTIVE' ? (
                            <Button size="sm" variant="danger" icon={UserX} onClick={() => handleToggleStatus(u.id, u.status)}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button size="sm" variant="success" icon={UserCheck} onClick={() => handleToggleStatus(u.id, u.status)}>
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value="STUDENT">Student</option>
                <option value="SECURITY_OFFICER">Security Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              >
                <option value="ACTIVE">ACTIVE (Enabled)</option>
                <option value="INACTIVE">INACTIVE (Disabled)</option>
                <option value="ON_LEAVE">ON LEAVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password {editingUser ? '(Leave blank to keep unchanged)' : ''}
            </label>
            <input
              type="password"
              placeholder={editingUser ? '••••••••' : 'Default: CampusGuard@123'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
