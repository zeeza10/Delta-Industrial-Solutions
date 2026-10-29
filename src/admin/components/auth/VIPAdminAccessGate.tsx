/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  CornerDownLeft, 
  Sparkles,
  KeyRound,
  Send,
  UserPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, TARGET_OWNER_EMAIL } from '../../../context/AuthContext';
import { SEO } from '../../../components/common/SEO';
import { logAdminSignIn, logAdminAuthFailed } from '../../utils/adminAudit';

interface VIPAdminAccessGateProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export const VIPAdminAccessGate: React.FC<VIPAdminAccessGateProps> = ({ 
  onSuccess, 
  redirectUrl = '/admin' 
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail,
    signInWithGoogle, 
    resetPassword,
    user, 
    isAdmin, 
    isOwner 
  } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const targetEmail = email.trim() || TARGET_OWNER_EMAIL;

    if (!password) {
      setErrorMessage('Please enter your clearance password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        // Create account with initial password
        const res = await signUpWithEmail(targetEmail, password, { displayName: 'System Owner' });
        if (res.success) {
          setStatusMessage(`Account created successfully for ${targetEmail} with Owner privileges!`);
          if (onSuccess) onSuccess();
          else navigate(redirectUrl);
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      } else {
        const res = await signInWithEmail(targetEmail, password);
        if (res.success && res.user) {
          await logAdminSignIn(res.user.uid, targetEmail, res.user.displayName || targetEmail);
          setStatusMessage('Authentication verified. Loading administrative session...');
          if (onSuccess) onSuccess();
          else navigate(redirectUrl);
        } else {
          const errorText = res.error || 'Access denied: Invalid administrative credentials.';
          await logAdminAuthFailed(targetEmail, errorText);
          
          // If user not found, suggest registering password
          if (errorText.toLowerCase().includes('invalid email or password') || errorText.toLowerCase().includes('not found')) {
            setErrorMessage(`${errorText} If this account is not yet registered with a password, switch to "Create Account / Set Password".`);
          } else {
            setErrorMessage(errorText);
          }
        }
      }
    } catch (err: any) {
      const catchText = err.message || 'System communication error during authentication.';
      await logAdminAuthFailed(targetEmail, catchText);
      setErrorMessage(catchText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        await logAdminSignIn(res.user.uid, res.user.email || 'sso@google.com', res.user.displayName || 'Google SSO Admin');
        setStatusMessage('Google Workspace session verified. Establishing clearance...');
        if (onSuccess) onSuccess();
        else navigate(redirectUrl);
      } else {
        const errorText = res.error || 'Google single sign-on was cancelled or rejected.';
        await logAdminAuthFailed('Google-SSO-User', errorText);
        setErrorMessage(errorText);
      }
    } catch (err: any) {
      const catchText = err.message || 'Single sign-on provider communication failure.';
      await logAdminAuthFailed('Google-SSO-User', catchText);
      setErrorMessage(catchText);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    const targetEmail = email.trim() || TARGET_OWNER_EMAIL;
    setErrorMessage(null);
    setStatusMessage(null);
    setIsResetLoading(true);

    try {
      const res = await resetPassword(targetEmail);
      if (res.success) {
        setStatusMessage(`Password reset link sent to ${targetEmail}. Please check your email inbox!`);
      } else {
        setErrorMessage(res.error || 'Failed to send password reset link.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending password reset link.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handlePreFillOwner = () => {
    setEmail(TARGET_OWNER_EMAIL);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#090B10] text-slate-100 flex items-center justify-center p-4 selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      <SEO title="VIP Admin Access Gate | Delta Industrial Solutions" noIndex={true} />

      {/* Background Cyberpunk Ambient Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 z-0 overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#22D3EE]/10 to-[#F5A623]/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md font-mono">
        {/* Top Emblem & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#121823] border border-[#22D3EE]/40 shadow-[0_0_25px_rgba(34,211,238,0.2)] mb-3">
            <span className="font-extrabold text-2xl text-[#22D3EE] select-none">Δ</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase">
            VIP Admin Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            DELTA INDUSTRIAL SOLUTIONS // CONTROL CENTER
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#121823] border border-[#273244] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Clearance Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0D1118] border border-[#273244] text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[#22D3EE] uppercase tracking-wider block">
                Restricted Management Zone
              </span>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Authorized Delta Industrial personnel and system administrators only. All sessions are cryptographically logged.
              </p>
            </div>
          </div>

          {/* Owner Quick-Bootstrap Notice */}
          <div className="p-3 rounded-lg bg-[#18212D]/80 border border-[#F5A623]/30 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#F5A623] font-bold flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Root Owner Account
              </span>
              <button
                type="button"
                onClick={handlePreFillOwner}
                className="text-[10px] text-[#22D3EE] hover:underline focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
              >
                Autofill
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Designated administrative authority:{' '}
              <span className="text-slate-200 font-semibold">{TARGET_OWNER_EMAIL}</span>
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div 
              role="alert" 
              className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-xs text-red-200 flex items-start gap-2.5 animate-shake"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-300">Clearance Alert</p>
                <p className="text-[11px] text-red-200/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div 
              role="status" 
              className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium">{statusMessage}</span>
            </div>
          )}

          {/* Mode Switcher: Sign In vs Set Initial Password */}
          <div className="flex items-center justify-between border-b border-[#273244] pb-2 text-xs">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setErrorMessage(null); }}
              className={`pb-1 font-bold border-b-2 transition-colors ${
                !isRegistering ? 'border-[#22D3EE] text-[#22D3EE]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setErrorMessage(null); }}
              className={`pb-1 font-bold border-b-2 transition-colors ${
                isRegistering ? 'border-[#22D3EE] text-[#22D3EE]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account / Set Password
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-email" 
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300"
              >
                Administrative Identity / Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="309amaanu@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="admin-password" 
                  className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300"
                >
                  {isRegistering ? 'Choose New Password' : 'Clearance Key / Password'}
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={isResetLoading}
                    className="text-[10px] text-[#22D3EE] hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {isResetLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>Forgot / Send Reset Email</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#090B10] border border-[#273244] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] hover:from-[#38BDF8] hover:to-[#22D3EE] text-[#090B10] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#22D3EE] outline-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRegistering ? 'Creating Account...' : 'Validating Clearance...'}</span>
                </>
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Set Password</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#273244] w-full" />
            <span className="bg-[#121823] px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono shrink-0">
              OR SINGLE SIGN-ON (RECOMMENDED)
            </span>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#18212D] hover:bg-[#1E293B] border border-[#273244] hover:border-[#22D3EE]/50 text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#22D3EE]" />
                <span>Connecting SSO Provider...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Workspace Sign-In (No Password)</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#22D3EE] transition-colors focus-visible:ring-1 focus-visible:ring-[#22D3EE] outline-none rounded px-2 py-1"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>Return to Public Industrial Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
