import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    // Optionally save to localStorage so we don't annoy them for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Re-check visibility logic based on dismissal
  useEffect(() => {
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (lastDismissed) {
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(lastDismissed) < oneDay) {
        setIsVisible(false);
      }
    }
  }, [deferredPrompt]);

  return (
    <AnimatePresence>
      {isVisible && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-[100] sm:bottom-8 sm:right-8 sm:left-auto sm:w-80"
        >
          <div className="bg-navy p-5 rounded-[2rem] shadow-2xl border border-white/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <button onClick={dismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-4 w-4 text-blue-gray" />
              </button>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center shrink-0">
                <Download className="h-6 w-6 text-navy" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight mb-1">Pasang LahanBersama</h3>
                <p className="text-xs text-blue-gray font-medium leading-relaxed">
                  Pasang aplikasi di HP Anda untuk akses lebih cepat dan mudah.
                </p>
                <button
                  onClick={handleInstall}
                  className="mt-4 w-full bg-mint text-navy font-black py-2 rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-mint/20"
                >
                  Pasang Sekarang
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
