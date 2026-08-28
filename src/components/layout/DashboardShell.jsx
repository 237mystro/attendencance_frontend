import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { NAV_BY_PORTAL, OFF_NAV_TITLES, PAGE_SUMMARIES, PORTALS } from '@/constants/nav';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/context/socket-context';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * One layout for all three portals.
 *
 * The source shipped three near-identical 260–300 line dashboards; this renders
 * any of them from the config in `constants/nav.js`.
 *
 * Responsive behaviour: below `md` the sidebar is an off-canvas drawer opened
 * from the top bar; from `md` up it is docked and the drawer cannot show.
 */
export function DashboardShell({ portalKey }) {
  const portal = PORTALS[portalKey];
  const items = NAV_BY_PORTAL[portalKey];

  const { currentUser } = useAuth();
  const { unreadCount, pendingLateCount } = useSocket();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  // Remembering *where* the drawer was opened lets visibility be derived: any
  // navigation — including browser back — closes it without an effect, and
  // growing past the breakpoint hides it rather than leaving a stale overlay.
  const [drawer, setDrawer] = useState({ open: false, at: null });
  const drawerVisible = drawer.open && !isDesktop && drawer.at === location.pathname;

  const openDrawer = () => setDrawer({ open: true, at: location.pathname });
  const closeDrawer = () => setDrawer({ open: false, at: null });

  useEffect(() => {
    if (!drawerVisible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setDrawer({ open: false, at: null });
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerVisible]);

  const active = items.find(
    (item) =>
      location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  );
  // Screens without a sidebar entry get their title from the off-nav map, so
  // the top bar never mislabels them as "Dashboard".
  const lastSegment = location.pathname.split('/').filter(Boolean).pop();
  const title = active?.label || OFF_NAV_TITLES[lastSegment] || 'Dashboard';
  const summary = portalKey === 'branch' ? PAGE_SUMMARIES[title] : undefined;

  const sidebarProps = {
    portal,
    items,
    counts: { messages: unreadCount, late: pendingLateCount },
    user: currentUser,
  };

  return (
    <div className="flex min-h-dvh">
      {/* Docked sidebar, md and up. */}
      <aside className="hidden w-sidebar shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 w-sidebar">
          <Sidebar {...sidebarProps} />
        </div>
      </aside>

      {/* Off-canvas drawer, below md. */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          drawerVisible ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!drawerVisible}
        // `pointer-events-none` stops the mouse but not the keyboard: without
        // `inert`, every nav link in the closed drawer stays in the tab order.
        inert={!drawerVisible}
      >
        <div
          role="presentation"
          onClick={closeDrawer}
          className={cn(
            'absolute inset-0 bg-ink/50 transition-opacity duration-300',
            drawerVisible ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-sidebar max-w-[85vw] shadow-glass transition-transform duration-300',
            drawerVisible ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar
            {...sidebarProps}
            showClose
            onClose={closeDrawer}
            onNavigate={closeDrawer}
          />
        </div>
      </div>

      {/* `min-w-0` is what stops a wide table from forcing the page sideways. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          summary={summary}
          portalKey={portalKey}
          unreadCount={unreadCount}
          onOpenNav={openDrawer}
        />
        <main id="main-content" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Bound shells for the route table. */
export const AdminShell = () => <DashboardShell portalKey="admin" />;
export const BranchShell = () => <DashboardShell portalKey="branch" />;
export const EmployeeShell = () => <DashboardShell portalKey="employee" />;
