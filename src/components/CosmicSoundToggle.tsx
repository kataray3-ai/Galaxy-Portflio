import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cosmicAudio } from '../audio/cosmicAudio';

export function CosmicSoundToggle() {
  const [status, setStatus] = useState(() => cosmicAudio.getStatus());

  useEffect(() => {
    const unsubscribe = cosmicAudio.subscribe(() => {
      setStatus(cosmicAudio.getStatus());
    });

    const permitted = cosmicAudio.tryAutoStartIfPermitted();

    const unlockOnGesture = () => {
      if (cosmicAudio.getStatus().enabled) {
        void cosmicAudio.start();
      }
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
    };

    if (!permitted) {
      window.addEventListener('pointerdown', unlockOnGesture, { once: true, passive: true });
      window.addEventListener('keydown', unlockOnGesture, { once: true });
      window.addEventListener('touchstart', unlockOnGesture, { once: true, passive: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        void cosmicAudio.toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleToggle = () => {
    void cosmicAudio.toggle();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={status.enabled}
      aria-label={status.enabled ? 'Mute cosmic background sound' : 'Turn on cosmic background sound'}
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium shadow-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B041] ${
        status.enabled
          ? 'border-[#F5B041]/50 bg-[#0B101E]/95 text-[#F5B041] hover:bg-[#131B30]'
          : 'border-white/15 bg-[#0B101E]/90 text-slate-300 hover:text-white hover:bg-[#131B30]'
      }`}
    >
      {status.enabled ? (
        <Volume2 className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <VolumeX className="h-3.5 w-3.5 shrink-0" />
      )}
      <span>
        {status.enabled
          ? status.awaitingGesture
            ? 'Sound ON (Tap to Play)'
            : 'Sound ON'
          : 'Sound Muted'}
      </span>
    </button>
  );
}
