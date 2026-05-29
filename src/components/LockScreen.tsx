import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Shield, Lock, Delete, ShieldAlert, UserPlus, ArrowRight } from 'lucide-react';
import { PolymorphicCard } from './ui/PolymorphicCard';
import { PolymorphicButton } from './ui/PolymorphicButton';

export default function LockScreen() {
  const { unlockVault, registerUser, settings, updateSettings, users } = useStore();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Sign Up Modal/Flow State
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupPin, setSignupPin] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('Committee Member');
  const [regAccess, setRegAccess] = useState<'full' | 'view_only'>('view_only');

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
    if (passcode.length >= 8) return;
    setError(false);
    setPasscode(passcode + num);
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

  const handleUnlock = () => {
    if (secondsLeft > 0 || passcode.length === 0) return;

    // Check if the passcode is registered
    const exists = users.some(u => u.pin === passcode);

    if (exists) {
      const success = unlockVault(passcode);
      if (!success) {
        setError(true);
        setShake(true);
        setPasscode('');
        setTimeout(() => setShake(false), 500);
      }
    } else {
      // New passcode detected -> Trigger Sign Up
      setSignupPin(passcode);
      setIsSigningUp(true);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) return;

    // Register user and automatically logs them in
    registerUser(regName, regRole, regAccess, signupPin);
    
    // Reset Sign Up Screen
    setIsSigningUp(false);
    setRegName('');
    setRegRole('Committee Member');
    setRegAccess('view_only');
    setPasscode('');
  };

  const handleCancelSignUp = () => {
    setIsSigningUp(false);
    setPasscode('');
    setSignupPin('');
  };

  const isLockedOut = secondsLeft > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page-light dark:bg-page-dark overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-primary/10 dark:bg-primary/20 blur-[80px] sm:blur-[120px] pointer-events-none animate-glow-1"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-income/10 dark:bg-income/10 blur-[70px] sm:blur-[100px] pointer-events-none animate-glow-2"></div>

      <div className={`w-full max-w-sm px-6 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        <PolymorphicCard className="flex flex-col items-center gap-6 text-center backdrop-blur-2xl">
          
          {isSigningUp ? (
            /* Sign Up Screen */
            <div className="w-full flex flex-col gap-4 text-left animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus size={20} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[16px] font-bold text-text-primary dark:text-white leading-none">Register Account</h3>
                  <span className="text-[11px] text-text-secondary mt-1 font-medium leading-none">
                    Vault passcode: <strong className="font-mono text-primary">{signupPin.replace(/./g, '•')}</strong>
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4 mt-2">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary font-medium"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Role / Position</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Auditor, Committee Member"
                    className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary font-medium"
                    value={regRole}
                    onChange={e => setRegRole(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Access Level</label>
                  <select 
                    className="w-full px-3 py-2 bg-white/20 dark:bg-card-dark/20 border border-white/25 dark:border-white/10 rounded-[8px] text-[14px] text-text-primary dark:text-white focus:outline-none focus:border-primary font-medium"
                    value={regAccess}
                    onChange={e => setRegAccess(e.target.value as any)}
                  >
                    <option value="view_only">View Only (Audit/Reviewer)</option>
                    <option value="full">Full Access (Treasurer/Admin)</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-4">
                  <PolymorphicButton type="button" variant="glass" className="flex-1" onClick={handleCancelSignUp}>
                    Cancel
                  </PolymorphicButton>
                  <PolymorphicButton type="submit" variant="primary" className="flex-1">
                    Create & Unlock
                  </PolymorphicButton>
                </div>
              </form>
            </div>
          ) : (
            /* PIN Security Input Screen */
            <>
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
                  <p className="text-[12px] text-text-tertiary mt-1">Enter passcode to access {settings.clubName}</p>
                </div>
              )}

              {/* Typed Passcode Indicator */}
              {!isLockedOut && (
                <div className="flex flex-col items-center gap-2 my-2 w-full">
                  <div className="h-7 flex items-center justify-center font-mono text-[24px] font-bold tracking-[0.2em] text-primary">
                    {passcode.length > 0 ? passcode.replace(/./g, '•') : <span className="text-text-tertiary/30 text-[14px] font-sans font-normal tracking-normal select-none">passcode</span>}
                  </div>
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
              
              {!isLockedOut && (
                <PolymorphicButton 
                  variant="primary" 
                  className="w-full max-w-[240px] mt-2 shadow-lg shadow-primary/10 cursor-pointer"
                  onClick={handleUnlock}
                  disabled={passcode.length === 0}
                >
                  Unlock Vault <ArrowRight size={15} />
                </PolymorphicButton>
              )}
              
              {error && !isLockedOut && (
                <p className="text-[12px] text-expense font-medium animate-fade-in mt-1 flex items-center gap-1 justify-center">
                  <Lock size={12} /> Incorrect passcode ({3 - settings.failedAttempts} attempts left)
                </p>
              )}
            </>
          )}
        </PolymorphicCard>
      </div>
    </div>
  );
}
