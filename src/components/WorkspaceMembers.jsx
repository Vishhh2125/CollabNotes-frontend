import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTenantMemberships, addMemberToTenant, removeMembership, changeMemberRole } from '../features/tenantMembershipSlice';

export default function WorkspaceMembers() {
  const dispatch = useDispatch();
  const { memberships, status } = useSelector(state => state.tenantMembership);
  const { currentTenant } = useSelector(state => state.tenant);
  const { user } = useSelector(state => state.user);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberData, setAddMemberData] = useState({ emailOrUserId: '', role: 'member' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentTenant?._id) {
      dispatch(getAllTenantMemberships(currentTenant._id));
    }
  }, [currentTenant, dispatch]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!addMemberData.emailOrUserId.trim()) {
      newErrors.emailOrUserId = 'Email or User ID is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Backend requires userId, so we'll use the input value as userId
    // (assuming user provides either email or userId)
    await dispatch(addMemberToTenant({
      tenantId: currentTenant._id,
      memberData: {
        userId: addMemberData.emailOrUserId.trim(),
        role: addMemberData.role
      }
    }));

    if (status !== 'failed') {
      setIsAddMemberOpen(false);
      setAddMemberData({ emailOrUserId: '', role: 'member' });
      setErrors({});
      await dispatch(getAllTenantMemberships(currentTenant._id));
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the workspace?')) {
      await dispatch(removeMembership({
        tenantId: currentTenant._id,
        userId
      }));
      await dispatch(getAllTenantMemberships(currentTenant._id));
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    await dispatch(changeMemberRole({
      tenantId: currentTenant._id,
      userId,
      role: newRole
    }));
    await dispatch(getAllTenantMemberships(currentTenant._id));
  };

  if (status === 'loading' && memberships.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Collaborators</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage collaborators and their roles in {currentTenant?.name}
          </p>
        </div>
        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Collaborator
        </button>
      </div>

      {/* Members List */}
      {memberships.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-[#121421] border border-indigo-400/25">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400 mb-4">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p className="text-slate-400 mb-2">No collaborators yet</p>
          <p className="text-slate-500 text-sm">Add collaborators to your workspace</p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#121421] border border-indigo-400/25 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0b0d14] border-b border-indigo-400/25">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Collaborator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-400/10">
                {memberships.map((membership) => {
                  const memberUser = membership.userId;
                  const isCurrentUser = memberUser?._id === user?._id || memberUser === user?._id;
                  
                  return (
                    <tr key={membership._id} className="hover:bg-[#0b0d14]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {memberUser?.username || 'Unknown User'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-slate-500">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400">
                            {memberUser?.email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={membership.role}
                          onChange={(e) => handleChangeRole(membership.userId?._id || membership.userId, e.target.value)}
                          disabled={isCurrentUser}
                          className={`px-3 py-1.5 rounded-md text-sm border ${
                            membership.role === 'admin'
                              ? 'bg-indigo-400/10 border-indigo-400/25 text-indigo-400'
                              : 'bg-slate-400/10 border-slate-400/25 text-slate-400'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-400/20 ${
                            isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(membership.userId?._id || membership.userId)}
                            className="px-3 py-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40 transition-all duration-200"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121421] rounded-xl border border-indigo-400/25 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-indigo-400/25">
              <h2 className="text-xl font-semibold text-white">Add Member</h2>
              <button
                onClick={() => {
                  setIsAddMemberOpen(false);
                  setAddMemberData({ emailOrUserId: '', role: 'member' });
                  setErrors({});
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#0b0d14] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email or User ID</label>
                <input
                  type="text"
                  value={addMemberData.emailOrUserId}
                  onChange={(e) => {
                    setAddMemberData({ ...addMemberData, emailOrUserId: e.target.value });
                    if (errors.emailOrUserId) setErrors({ ...errors, emailOrUserId: '' });
                  }}
                  className={`w-full px-4 py-2 rounded-md bg-[#0b0d14] border ${
                    errors.emailOrUserId ? 'border-red-500' : 'border-indigo-400/20'
                  } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-white`}
                  placeholder="user@example.com or user_id"
                />
                {errors.emailOrUserId && (
                  <p className="text-red-500 text-xs mt-1">{errors.emailOrUserId}</p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  Enter the email address or User ID of the person you want to add as a collaborator
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Role</label>
                <select
                  value={addMemberData.role}
                  onChange={(e) => setAddMemberData({ ...addMemberData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-md bg-[#0b0d14] border border-indigo-400/20 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-white"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMemberOpen(false);
                    setAddMemberData({ emailOrUserId: '', role: 'member' });
                    setErrors({});
                  }}
                  className="px-4 py-2 rounded-md text-slate-400 hover:text-white hover:bg-[#0b0d14] border border-indigo-400/20 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Adding...' : 'Add Collaborator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

