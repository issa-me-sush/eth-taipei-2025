import { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white ">
      {/* <Header /> */}
      <main className="pb-16">
        {children}
      </main>
      {/* <BottomNav /> */}
    </div>
  );
} 