import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Avatar, CountBadge, IconButton } from '@/components/ui';
import { ROLE_LABELS } from '@/constants/roles';
import { cn } from '@/lib/cn';

/**
 * The portal sidebar. Rendered twice by `DashboardShell` — once docked from
 * `md` up, once inside the mobile drawer — from the same markup, so the two
 * can never drift apart.
 */
export function Sidebar({ portal, items, counts, user, onNavigate, onClose, showClose }) {
  const LogoIcon = portal.logoIcon;

  return (
    <div
      className="flex h-full flex-col text-white"
      style={{ backgroundImage: portal.gradient }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br',
            portal.logoGradient,
          )}
        >
          <LogoIcon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base leading-tight font-extrabold tracking-tight">
            AutoPayroll
          </p>
          <p className="text-[10px] text-white/45">{portal.label}</p>
        </div>

        {showClose && (
          <IconButton
            label="Close navigation"
            size="sm"
            onClick={onClose}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X aria-hidden="true" className="size-5" />
          </IconButton>
        )}
      </div>

      <nav aria-label={`${portal.label} navigation`} className="min-h-0 flex-1 overflow-y-auto scrollbar-slim px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const count = item.badge ? counts[item.badge] : 0;

            return (
              <li key={item.to}>
                {/* The active item takes its accent as `currentColor`, so the
                    3px left border and the icon share it while the label stays
                    white — the per-item colour coding of the original. */}
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-tap items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-sm transition-all duration-200',
                      isActive
                        ? cn('border-current bg-white/16', item.accent)
                        : 'border-transparent text-white/65 hover:bg-white/10',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate',
                          isActive ? 'font-bold text-white' : 'font-medium text-white/85',
                        )}
                      >
                        {item.label}
                      </span>
                      <CountBadge
                        count={count}
                        tone={item.badge === 'late' ? 'warn' : 'danger'}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl p-1">
          <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name || 'Signed in'}</p>
            <p className="truncate text-[10px] text-white/45">
              {ROLE_LABELS[user?.role] || user?.position || 'Team member'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
