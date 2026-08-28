import { Camera, Save } from 'lucide-react';
import { useRef } from 'react';

import { Alert, Avatar, Button, Input, Panel, Select } from '@/components/ui';
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  getPhoneHelperText,
} from '@/constants/countries';

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map((country) => ({
  value: country.code,
  label: `${country.name} (${country.dialCode})`,
}));

/** Avatar picker with a live preview of the chosen file. */
export function AvatarPicker({ preview, name, onChoose, hasNewAvatar }) {
  const input = useRef(null);

  return (
    <div className="flex items-center gap-4">
      <Avatar src={preview || undefined} name={name} size="xl" />

      <div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choose a profile picture"
          onChange={(event) => {
            onChoose(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <Button
          variant="secondary"
          startIcon={<Camera aria-hidden="true" className="size-4" />}
          onClick={() => input.current?.click()}
        >
          Change picture
        </Button>
        <p className="mt-1.5 text-xs text-muted dark:text-muted-soft">
          {hasNewAvatar
            ? 'New picture ready — save to apply it.'
            : 'JPG or PNG, up to 5 MB.'}
        </p>
      </div>
    </div>
  );
}

/** Name, contact details, and profile picture. */
export function ProfileSection({ profile }) {
  const country = getCountryConfig(profile.values.countryCode);

  const phoneProps = (field, label) => ({
    label,
    type: 'tel',
    inputMode: 'numeric',
    value: profile.values[field],
    onChange: (event) => profile.setPhoneField(field, event.target.value),
    hint: getPhoneHelperText(profile.values.countryCode),
    className: 'pl-16',
    startIcon: (
      <span className="text-sm font-bold text-slate-600 dark:text-muted-soft">
        {country.dialCode}
      </span>
    ),
  });

  return (
    <Panel
      title="Profile"
      subtitle="How you appear to colleagues, and how payroll reaches you."
      interactive={false}
    >
      <div className="flex flex-col gap-5">
        {profile.error && <Alert tone="danger">{profile.error}</Alert>}

        <AvatarPicker
          preview={profile.avatarPreview}
          name={profile.values.name}
          hasNewAvatar={profile.hasNewAvatar}
          onChoose={profile.chooseAvatar}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            value={profile.values.name}
            onChange={(event) => profile.patch({ name: event.target.value })}
          />
          <Input
            label="Email address"
            type="email"
            value={profile.values.email}
            onChange={(event) => profile.patch({ email: event.target.value })}
          />

          <Select
            label="Country"
            options={COUNTRY_OPTIONS}
            value={profile.values.countryCode}
            onChange={(event) => profile.setCountry(event.target.value)}
          />
          <Input
            label="Position"
            value={profile.values.position}
            onChange={(event) => profile.patch({ position: event.target.value })}
          />

          <Input {...phoneProps('phone', 'Phone number')} />
          <Input {...phoneProps('momoNumber', 'Mobile money number')} />
        </div>

        <Button
          className="self-start"
          loading={profile.saving}
          startIcon={<Save aria-hidden="true" className="size-4" />}
          onClick={profile.save}
        >
          Save profile
        </Button>
      </div>
    </Panel>
  );
}
