import { Bell, LogOut, Menu, Moon, Settings, Sun, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Avatar,
  CountBadge,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  IconButton,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { InstallPwaButton } from './InstallPwaButton';

/**
 * The sticky top bar: page title, theme toggle, message bell, and the account
 * menu. `onOpenNav` is only wired to a visible control below `md`, where the
 * sidebar is a drawer.
 */
export function Topbar({ title, summary, portalKey, unreadCount, onOpenNav }) {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const portal = ROUTES[portalKey];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-xl dark:border-line-dark dark:bg-canvas-dark/90">
      <div className="flex min-h-16 items-center gap-2 px-3 sm:px-5">
        <IconButton label="Open navigation" onClick={onOpenNav} className="md:hidden">
          <Menu aria-hidden="true" className="size-5" />
        </IconButton>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base leading-tight font-bold text-ink sm:text-lg dark:text-ink-dark">
            {title}
          </h1>
          {summary && (
            <p className="hidden truncate text-xs text-muted md:block dark:text-muted-soft">
              {summary}
            </p>
          )}
        </div>

        <InstallPwaButton />

        <IconButton
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun aria-hidden="true" className="size-5" />
          ) : (
            <Moon aria-hidden="true" className="size-5" />
          )}
        </IconButton>

        <div className="relative">
          <IconButton
            label={
              unreadCount > 0
                ? `Messages, ${unreadCount} unread`
                : 'Messages and announcements'
            }
            onClick={() => navigate(portal.messaging)}
          >
            <Bell aria-hidden="true" className="size-5" />
          </IconButton>
          <CountBadge
            count={unreadCount}
            className="pointer-events-none absolute -top-0.5 -right-0.5"
          />
        </div>

        <Dropdown
          trigger={(triggerProps) => (
            <button
              type="button"
              aria-label="Account menu"
              className="flex size-11 shrink-0 items-center justify-center rounded-full"
              {...triggerProps}
            >
              <Avatar src={currentUser?.avatarUrl} name={currentUser?.name} size="sm" />
            </button>
          )}
        >
          <div className="border-b border-line px-4 py-2.5 dark:border-line-dark">
            <p className="truncate text-sm font-bold text-ink dark:text-ink-dark">
              {currentUser?.name || 'Signed in'}
            </p>
            <p className="truncate text-xs text-muted dark:text-muted-soft">
              {currentUser?.email}
            </p>
          </div>

          <DropdownItem as={Link} to={portal.profile} icon={<UserRound className="size-4" />}>
            Profile
          </DropdownItem>
          <DropdownItem as={Link} to={portal.settings} icon={<Settings className="size-4" />}>
            Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem danger onClick={handleLogout} icon={<LogOut className="size-4" />}>
            Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
