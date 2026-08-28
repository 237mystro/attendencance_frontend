import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { IconButton } from '@/components/ui';

/**
 * Offers the browser's "install app" prompt, and renders nothing until the
 * browser says one is available — so it stays hidden on desktops and on
 * devices where the app is already installed.
 */
export function InstallPwaButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const capture = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    const clear = () => setPrompt(null);

    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', clear);
    return () => {
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', clear);
    };
  }, []);

  if (!prompt) return null;

  const handleInstall = async () => {
    prompt.prompt();
    await prompt.userChoice;
    // The event can only be used once, whatever the user chose.
    setPrompt(null);
  };

  return (
    <IconButton label="Install this app" onClick={handleInstall}>
      <Download aria-hidden="true" className="size-5" />
    </IconButton>
  );
}
