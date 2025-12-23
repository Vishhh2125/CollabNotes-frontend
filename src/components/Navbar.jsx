import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/userSlice';
import { getAllTenants, setCurrentTenant, resetTenantState } from '../features/tenantSlice';
import { resetNoteState } from '../features/noteSlice';
import { resetMembershipState } from '../features/tenantMembershipSlice';
import WorkspaceSelector from './WorkspaceSelector';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.user);
  const { currentTenant, tenants } = useSelector(state => state.tenant);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (tenants.length === 0) {
      dispatch(getAllTenants());
    }
  }, [dispatch, tenants.length]);

  useEffect(() => {
    if (tenants.length > 0 && !currentTenant) {
      dispatch(setCurrentTenant(tenants[0]));
    }
  }, [tenants, currentTenant, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    dispatch(resetTenantState());
    dispatch(resetNoteState());
    dispatch(resetMembershipState());
    dispatch(logout());
    navigate('/login', { replace: true });
    setIsProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#121421] border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-8 flex-1">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
                C
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                CollabNotes
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'bg-indigo-500/15 text-indigo-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => navigate('/settings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/settings')
                    ? 'bg-indigo-500/15 text-indigo-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Workspace Settings
              </button>
            </nav>
          </div>

          {/* Right Section: Workspace + Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Workspace Selector */}
            <WorkspaceSelector />

            {/* User Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200"
                aria-label="User profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#1a1d2e] border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
