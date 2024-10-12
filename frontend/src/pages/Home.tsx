// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10">
      
      <div className="text-white mt-4 font-bold text-2xl">
        Share
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
        {!isInstalled && isInstallable ? (
          <Button className="w-full" onClick={handleInstallClick}>
            Install PWA
          </Button>
        ) : (
          <Button className="w-full" disabled>
            {isInstalled ? 'App Installed' : 'Install Unavailable'}
          </Button>
        )}
        <a href='https://github.com/pocopepe/share' target='_blank'>
          <Button className="w-full">Docs</Button>
        </a>
        <a href='https://github.com/pocopepe' target='_blank'>
          <Button className="w-full">Developer Info</Button>
        </a>
      </div>
    </div>
  );
}

export default Home;
