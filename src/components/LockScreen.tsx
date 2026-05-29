import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Shield, Lock, Delete, ShieldAlert } from 'lucide-react';
import { PolymorphicCard } from './ui/PolymorphicCard';

export default function LockScreen() {
  const { unlockVault, settings, updateSettings } = useStore();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (!settings.lockoutUntil) {
      setSecondsLeft(0);
      return;
    }

    const checkLockout = () => {
      const now = Date.now();
      const expiry = new Date(settings.lockoutUntil!).getTime();
      const diff = Math.ceil((expiry - now) / 1000);

      if (diff <= 0) {
        updateSettings({ lockoutUntil: null, failedAttempts: 0 });
        setSecondsLeft(0);
      } else {
        setSecondsLeft(diff);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);

    return () => clearInterval(interval);
  }, [settings.lockoutUntil, updateSettings]);

  const handleKeyPress = (num: string) => {
    if (secondsLeft > 0) return; // Block inputs during lockout
    if (passcode.length >= 4) return;
    setError(false);
    const newPasscode = passcode + num;
    setPasscode(newPasscode);

    if (newPasscode.length === 4) {
      setTimeout(() => {
        const success = unlockVault(newPasscode);
        if (!success) {
          setError(true);
          setShake(true);
          setPasscode('');
          setTimeout(() => setShake(false), 500);
        }
      }, 200);
    }
  };

  const handleBackspace = () => {
    if (secondsLeft > 0) return;
    setError(false);
    setPasscode(passcode.slice(0, -1));
  };

  const handleClear = () => {
    if (secondsLeft > 0) return;
    setError(false);
    setPasscode('');
  };

  const isLockedOut = secondsLeft > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page-light dark:bg-page-dark overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-primary/10 dark:bg-primary/20 blur-[80px] sm:blur-[120px] pointer-events-none animate-glow-1"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-income/10 dark:bg-income/10 blur-[70px] sm:blur-[100px] pointer-events-none animate-glow-2"></div>

      <div className={`w-full max-w-sm px-6 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        <PolymorphicCard className="flex flex-col items-center gap-6 text-center backdrop-blur-2xl">
          
          {isLockedOut ? (
            <div className="w-14 h-14 rounded-full bg-expense/10 dark:bg-expense/20 flex items-center justify-center text-expense shadow-inner animate-bounce">
              <ShieldAlert size={28} />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-white shadow-inner animate-pulse">
              <Shield size={28} />
            </div>
          )}

          {isLockedOut ? (
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.4px] text-expense">Security Lockout</h2>
              <p className="text-[13px] text-text-secondary dark:text-text-tertiary mt-2 px-2 leading-relaxed font-medium">
                Too many failed passcode attempts. Your vault has been securely locked.
              </p>
              <div className="bg-expense/5 border border-expense/20 rounded-[8px] p-2 mt-4 font-mono text-[16px] font-bold text-expense">
                Retry in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.4px] text-text-primary dark:text-white">Vault Secured</h2>
              <p className="text-[12px] text-text-tertiary mt-1">Enter PIN to access {settings.clubName}</p>
            </div>
          )}

          {/* Dots Indicator */}
          {!isLockedOut && (
            <div className="flex gap-4 my-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                    passcode.length > index
                      ? 'bg-primary border-primary scale-110 shadow-sm shadow-primary/50'
                      : error 
                        ? 'border-expense bg-expense/20 animate-pulse'
                        : 'border-border-light dark:border-border-dark bg-transparent'
                  }`}
                ></div>
              ))}
            </div>
          )}

          {/* Numeric Keypad */}
          {!isLockedOut && (
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-[240px] mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="w-12 h-12 rounded-full border border-white/20 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-primary/15 dark:hover:bg-primary/20 hover:border-primary/20 transition-all text-[18px] font-medium text-text-primary dark:text-white flex items-center justify-center active:scale-[0.93] select-none"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="w-12 h-12 text-[12px] text-text-secondary hover:text-text-primary dark:text-text-tertiary dark:hover:text-white select-none transition-colors active:scale-[0.93]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-12 h-12 rounded-full border border-white/20 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-primary/15 dark:hover:bg-primary/20 hover:border-primary/20 transition-all text-[18px] font-medium text-text-primary dark:text-white flex items-center justify-center active:scale-[0.93] select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="w-12 h-12 text-text-secondary hover:text-text-primary dark:text-text-tertiary dark:hover:text-white flex items-center justify-center select-none transition-colors active:scale-[0.93]"
              >
                <Delete size={18} />
              </button>
            </div>
          )}
          
          {error && !isLockedOut && (
            <p className="text-[12px] text-expense font-medium animate-fade-in mt-1 flex items-center gap-1 justify-center">
              <Lock size={12} /> Incorrect PIN ({3 - settings.failedAttempts} attempts left)
            </p>
          )}
        </PolymorphicCard>
      </div>
    </div>
  );
}
