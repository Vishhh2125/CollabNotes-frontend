import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTenant } from '../features/tenantSlice';
import { getAllTenants } from '../features/tenantSlice';
import { clearNotes } from '../features/noteSlice';
import { clearMemberships } from '../features/tenantMembershipSlice';
import CreateWorkspaceModal from './CreateWorkspaceModal';

export default function WorkspaceSelector() {
  const dispatch = useDispatch();
  const { tenants, currentTenant, status } = useSelector(state => state.tenant);
  const { user } = useSelector(state => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user && tenants.length === 0 && status === 'idle') {
      dispatch(getAllTenants());
    }
  }, [user, tenants.length, status, dispatch]);

  const handleWorkspaceChange = (tenantId) => {
    // Clear old data first before switching
    dispatch(clearNotes());
    dispatch(clearMemberships());
    
    // Now tenants are actual tenant objects with userRole property
    const selectedTenant = tenants.find(t => {
      const id = t._id || t;
      return id === tenantId || id?.toString() === tenantId;
    });
    
    if (selectedTenant) {
      dispatch(setCurrentTenant(selectedTenant));
    }
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === '__create_new__') {
      setIsCreateModalOpen(true);
    } else {
      handleWorkspaceChange(value);
    }
  };

  if (status === 'loading') {
    return (
      <div className="px-4 py-2 text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-sm font-medium">Workspace:</span>
      <select
        value={currentTenant?._id || ''}
        onChange={handleSelectChange}
        className="min-w-[220px] px-4 py-2 rounded-lg bg-[#1a1d2e] border border-slate-700/50 text-white font-medium focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 hover:border-slate-600 transition-all cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center'
        }}
      >
        {tenants.length === 0 && (
          <option value="">Select Workspace</option>
        )}
        {tenants.map((tenant) => {
          const tenantId = tenant._id || tenant;
          const tenantName = tenant.name || 'Unnamed Workspace';
          return (
            <option key={tenantId} value={tenantId}>
              {tenantName}
            </option>
          );
        })}
        <option value="__create_new__" style={{ borderTop: '1px solid #374151' }}>
          + Create Workspace
        </option>
      </select>
      
      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

