import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { editTenantSubscription, deleteTenant } from '../features/tenantSlice';
import { getAllTenantMemberships, addMemberToTenant, removeMembership, changeMemberRole, resetMembershipState } from '../features/tenantMembershipSlice';
import { clearNotes } from '../features/noteSlice';

export default function WorkspaceSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTenant, status, error, tenants } = useSelector((state) => state.tenant);
  const { memberships, status: membershipStatus } = useSelector((state) => state.tenantMembership);
  const { user } = useSelector((state) => state.user);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberData, setAddMemberData] = useState({ emailOrUserId: '', role: 'member' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentTenant?._id) {
      dispatch(getAllTenantMemberships(currentTenant._id));
    }
  }, [currentTenant, dispatch]);

  if (!currentTenant) {
    return (
      <div className="text-center py-12 rounded-xl bg-[#121421] border border-indigo-400/25">
        <p className="text-slate-400">Select a workspace to manage settings.</p>
      </div>
    );
  }

  const handlePlanChange = async (plan) => {
    if (currentTenant.plan === plan || status === 'loading') return;
    await dispatch(editTenantSubscription({ tenantId: currentTenant._id, plan }));
  };

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

    await dispatch(addMemberToTenant({
      tenantId: currentTenant._id,
      memberData: {
        userId: addMemberData.emailOrUserId.trim(),
        role: addMemberData.role
      }
    }));

    if (membershipStatus !== 'failed') {
      setIsAddMemberOpen(false);
      setAddMemberData({ emailOrUserId: '', role: 'member' });
      setErrors({});
      await dispatch(getAllTenantMemberships(currentTenant._id));
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this collaborator from the workspace?')) {
      await dispatch(removeMembership({ tenantId: currentTenant._id, userId }));
      await dispatch(getAllTenantMemberships(currentTenant._id));
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    await dispatch(changeMemberRole({ tenantId: currentTenant._id, userId, role: newRole }));
    await dispatch(getAllTenantMemberships(currentTenant._id));
  };

  const handleDeleteWorkspace = async () => {
    if (currentTenant.userRole !== 'admin') return;
    const confirmed = window.confirm(`Delete workspace "${currentTenant.name}"? This cannot be undone.`);
    if (!confirmed) return;

    await dispatch(deleteTenant(currentTenant._id));
    dispatch(clearNotes());
    dispatch(resetMembershipState());

    // Navigate to root; tenant slice already moves to next available tenant
    navigate('/', { replace: true });
  };

  const isAdmin = currentTenant?.userRole === 'admin';

  return (
    <div className="rounded-xl bg-[#121421] border border-indigo-400/25 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Workspace Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage workspace details, collaborators, subscription, and deletion.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Workspace Info */}
      <div className="rounded-lg border border-slate-700/60 p-4 space-y-2 bg-[#0b0d14]/40">
        <h2 className="text-sm font-semibold text-slate-200 uppercase">Workspace Info</h2>
        <p className="text-slate-300 text-sm">Name: <span className="text-white font-medium">{currentTenant.name}</span></p>
        <p className="text-slate-300 text-sm">Plan: <span className="text-indigo-300 font-medium">{currentTenant.plan}</span></p>
        <p className="text-slate-500 text-xs">ID: {currentTenant._id}</p>
        <p className="text-slate-500 text-xs">Collaborators: {memberships.length}</p>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-slate-700/60 p-4 space-y-3 bg-[#0b0d14]/40">
        <h2 className="text-sm font-semibold text-slate-200 uppercase">Subscription</h2>
        <p className="text-slate-400 text-sm">
          Current plan: <span className="text-indigo-300 font-medium">{currentTenant.plan}</span>
        </p>
        {isAdmin ? (
          <>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handlePlanChange('free')}
                disabled={currentTenant.plan === 'free' || status === 'loading'}
                className="px-4 py-2 rounded-md border border-slate-600 text-slate-200 hover:border-indigo-400/50 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Switch to Free
              </button>
              <button
                onClick={() => handlePlanChange('pro')}
                disabled={currentTenant.plan === 'pro' || status === 'loading'}
                className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upgrade to Pro
              </button>
            </div>
            {status === 'loading' && (
              <p className="text-xs text-slate-500">Saving changes...</p>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-500">
        you are currenly on pro memebership 
          </p>
        )}
      </div>

      {/* Collaborators */}
      <div className="rounded-lg border border-slate-700/60 p-4 space-y-4 bg-[#0b0d14]/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 uppercase">Collaborators</h2>
            <p className="text-slate-400 text-sm">Manage workspace collaborators and their roles.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 transition-all duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Collaborator
            </button>
          )}
        </div>

        {membershipStatus === 'loading' && memberships.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
          </div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-slate-700 text-slate-400">
            No collaborators yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0b0d14] border-b border-indigo-400/25">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Collaborator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                  )}
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
                        {isAdmin ? (
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
                        ) : (
                          <span className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wide ${
                            membership.role === 'admin'
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-400/20'
                              : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                          }`}>
                            {membership.role}
                          </span>
                        )}
                      </td>
                      {isAdmin && (
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
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Member Modal */}
        {isAddMemberOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#121421] rounded-xl border border-indigo-400/25 w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-indigo-400/25">
                <h3 className="text-lg font-semibold text-white">Add Collaborator</h3>
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

                <div className="flex items-center justify-end gap-3 pt-2">
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
                    disabled={membershipStatus === 'loading'}
                    className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {membershipStatus === 'loading' ? 'Adding...' : 'Add Collaborator'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      {isAdmin && (
        <div className="rounded-lg border border-red-500/30 p-4 bg-red-500/5 space-y-3">
          <h2 className="text-sm font-semibold text-red-300 uppercase">Warning</h2>
          <p className="text-red-200 text-sm">
            Delete this workspace and all related data. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteWorkspace}
            className="px-4 py-2 rounded-md border border-red-400/50 text-red-200 hover:bg-red-500/10 transition-colors"
            disabled={tenants.length <= 1 && membershipStatus === 'loading'}
          >
            Delete Workspace
          </button>
        </div>
      )}
    </div>
  );
}

