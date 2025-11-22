import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  PersonIcon,
  GlobeIcon,
  ReaderIcon,
  ExitIcon,
  PlusIcon,
  DownloadIcon,
} from '@radix-ui/react-icons';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { IconProps } from '@radix-ui/react-icons/dist/types';

type NavigationItem = {
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  badge?: string;
};

type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

const navigation: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: ReaderIcon },
    ],
  },
  {
    title: 'Candidates',
    items: [
      { name: 'All Candidates', href: '/candidates', icon: PersonIcon },
      { name: 'Create Candidate', href: '/candidates/create', icon: PlusIcon },
      { name: 'Import from LinkedIn', href: '/candidates/import', icon: DownloadIcon },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Organizations', href: '/organizations', icon: GlobeIcon, badge: 'Soon' },
    ],
  },
];

interface AppSidebarProps {
  onLogout: () => void;
  userName?: string;
  organizationName?: string;
}

export const AppSidebar = React.memo(function AppSidebar({ onLogout, userName, organizationName }: AppSidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-foreground">HireStack</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6 px-3">
          {navigation.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t">
        <div className="p-4">
          <div className="mb-3 rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-semibold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{organizationName}</p>
          </div>
          <Separator className="my-3" />
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExitIcon className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
});
