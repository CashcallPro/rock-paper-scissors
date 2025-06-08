import React from 'react';
import MainLayout from '@/components/layout/MainLayout'; // Using alias @ if configured, adjust if not

interface TabsLayoutProps {
  children: React.ReactNode;
}

const TabsLayout: React.FC<TabsLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default TabsLayout;
