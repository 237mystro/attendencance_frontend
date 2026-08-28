import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

import { IconButton, Input } from '@/components/ui';

/**
 * Password field with a show/hide toggle.
 *
 * The toggle is a real button with an accessible name that flips with its
 * state, so a screen-reader user hears whether the password is currently
 * revealed — the source used a Tooltip, which is not announced.
 */
export function PasswordInput({ showLockIcon = true, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? 'text' : 'password'}
      startIcon={showLockIcon ? <Lock className="size-5" /> : undefined}
      endIcon={
        <IconButton
          label={visible ? 'Hide password' : 'Show password'}
          size="sm"
          onClick={() => setVisible((current) => !current)}
          // Never a submit target, and skipped in tab order so Enter from the
          // password field still submits the form.
          tabIndex={-1}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </IconButton>
      }
      {...props}
    />
  );
}
