import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navigation />
      <main className="w-full overflow-x-hidden sm:max-w-7xl sm:mx-auto py-4 px-2 sm:py-6 sm:px-6 lg:px-8">
        <div className="w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}