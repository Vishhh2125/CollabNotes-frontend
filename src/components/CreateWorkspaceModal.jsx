import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTenant, getAllTenants, setCurrentTenant } from '../features/tenantSlice';

export default function CreateWorkspaceModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.tenant);
  const [formData, setFormData] = useState({ name: '', plan: 'free' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateWorkspace = async (workspaceData) => {
    try {
      // 1. Create the tenant via API
      const result = await dispatch(createTenant(workspaceData)).unwrap();

      // 2. Refetch all tenants to get up-to-date roles/memberships
      const tenantsResult = await dispatch(getAllTenants()).unwrap();

      // 3. Find the new tenant by its _id (supports both tenant and membership-shaped payloads)
      const createdId = result?.tenantId?._id || result?._id;
      const newTenant = tenantsResult.find((t) => t._id === createdId);

      // 4. Set the new tenant as current (fallback to payload if refetch fails to include it)
      if (newTenant) {
        dispatch(setCurrentTenant(newTenant));
      } else if (result) {
        const fallbackTenant = result?.tenantId
          ? { ...result.tenantId, userRole: result.role || "admin" }
          : { ...result, userRole: result.role || "admin" };
        dispatch(setCurrentTenant(fallbackTenant));
      }

      // 5. Reset form and close
      setFormData({ name: "", plan: "free" });
      onClose?.();
    } catch {
      // Errors are surfaced via the slice `error` state; keep UI stable
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Workspace name must be at least 3 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await handleCreateWorkspace(formData);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#121421] rounded-xl border border-indigo-400/25 w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-indigo-400/25 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Create New Workspace</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#0b0d14] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-2">Workspace Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-md bg-[#0b0d14] border ${
                errors.name ? 'border-red-500' : 'border-indigo-400/20'
              } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-white`}
              placeholder="Enter workspace name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Plan</label>
            <select
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#0b0d14] border border-indigo-400/20 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-white"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-slate-400 hover:text-white hover:bg-[#0b0d14] border border-indigo-400/20 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal using portal to document.body to escape parent containers
  return createPortal(modalContent, document.body);
}

