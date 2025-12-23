import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, resetRegistrationState } from '../../features/userSlice';
import { logoutAndReset } from '../../features/sessionActions';
export function Register() {
    const {isAuthenticated}=useSelector(state=>state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationSuccess } = useSelector(state => state.user);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Clear any stale session data on entry to register
    dispatch(logoutAndReset());
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
    dispatch(resetRegistrationState());
  }, [dispatch, isAuthenticated, navigate]);


  useEffect(() => {


    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate('/login',{replace:true});
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    // Clear validation errors before submitting
    setValidationErrors({});
    
    // Dispatch register action - Redux handles loading and error states
    dispatch(register(formData));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1018] to-[#0b0d14] text-white flex items-center justify-center relative">
      {/* Dotted Grid Background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(129, 140, 248, 0.6) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="w-full max-w-md rounded-xl bg-[#121421] backdrop-blur-sm border border-indigo-400/25 p-8 relative z-10 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-lg border border-indigo-400 text-indigo-400 flex items-center justify-center font-bold hover:bg-indigo-400/10 hover:scale-110 transition-all duration-300 cursor-pointer">
            C
          </div>
          <p className="text-indigo-400 text-sm font-medium mb-2">Welcome to CollabNotes</p>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-slate-400 text-sm mt-2">Start managing your notes with CollabNotes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {registrationSuccess && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
              <p className="text-green-500 text-sm">Registration successful! Redirecting to login...</p>
            </div>
          )}
          
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-md bg-[#0b0d14] border ${
                validationErrors.username ? 'border-red-500' : 'border-indigo-400/20'
              } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 hover:border-indigo-400/40 transition-all duration-200`}
            />
            {validationErrors.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-md bg-[#0b0d14] border ${
                validationErrors.email ? 'border-red-500' : 'border-indigo-400/20'
              } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 hover:border-indigo-400/40 transition-all duration-200`}
            />
            {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 rounded-md bg-[#0b0d14] border ${
                  validationErrors.password ? 'border-red-500' : 'border-indigo-400/20'
                } focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 hover:border-indigo-400/40 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-indigo-400/25 bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
