import React from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../shared/store/useStore';
import NavigationBar from '../shared/components/NavigationBar';
import TopBar from '../shared/components/TopBar';
import InstallPrompt from '../shared/components/InstallPrompt';
import ConnectionBanner from '../shared/components/ConnectionBanner';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const userRole = useStore((s) => s.userRole);
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div
      className={[
        'console-dark min-h-screen bg-[color:var(--bg)]',
        isDashboard ? 'lg:bg-[color:var(--dash-bg)]' : '',
      ].join(' ')}
    >
      <Sidebar />

      <div className="lg:pl-[264px]">
        <TopBar />
        <ConnectionBanner />

        <main className="mx-auto w-full max-w-[480px] px-4 pb-28 pt-4 lg:max-w-[1180px] lg:px-8 lg:pb-16 lg:pt-6">
          <div
            key={location.pathname}
            className={['page-enter', isDashboard ? '' : 'lg:max-w-5xl'].join(' ')}
          >
            {children}
          </div>
        </main>

        {userRole === 'partner' && (
          <div className="fixed bottom-[76px] left-1/2 z-10 w-full max-w-[480px] -translate-x-1/2 border-t border-[color:var(--brand-soft)] bg-[color:var(--brand-soft)] px-4 py-2 text-center text-xs font-medium text-[color:var(--brand)] lg:bottom-4 lg:left-auto lg:right-8 lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-xl lg:border">
            Режим «Партнёр и кафедра»: создание задач и просмотр откликов
          </div>
        )}

        <div className="lg:hidden">
          <NavigationBar />
        </div>
        <InstallPrompt />
      </div>
    </div>
  );
};

export default Layout;
