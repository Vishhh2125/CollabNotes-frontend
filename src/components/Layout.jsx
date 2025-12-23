import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

export default function Layout() {
  const { currentTenant } = useSelector(state => state.tenant);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1018] to-[#0b0d14] text-white w-full">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentTenant ? (
          <Outlet />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No workspace selected</p>
          </div>
        )}
      </main>
    </div>
  );
}
