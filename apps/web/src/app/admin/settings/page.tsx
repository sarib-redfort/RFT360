import { adminGet } from '@/lib/admin-api';
import { SettingsForm } from './settings-form';

/** Site settings page (ADMIN only — enforced by the API + sidebar). */
export default async function SettingsPage() {
  const settings = await adminGet<Record<string, unknown>>('/admin/settings').catch(() => ({}));

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Settings</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Global site configuration — branding, contact, socials, SEO and analytics.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
