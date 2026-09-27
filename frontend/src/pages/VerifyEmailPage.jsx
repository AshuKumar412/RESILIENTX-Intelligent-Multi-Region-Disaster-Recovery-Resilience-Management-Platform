import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, ArrowRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialEmail = searchParams.get('email') || location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resending, setResending] = useState(false);

  const { verifyOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    // Only accept numeric character
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Take last character
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    if (!email) {
      setError('Corporate email is required.');
      return;
    }

    try {
      await verifyOtp(email, fullOtp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. The code may be invalid or expired.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email) return;
    setError('');
    setResending(true);
    try {
      await resendOtp(email);
      setInfoMessage('A new 6-digit cryptographic verification code has been dispatched.');
      setResendCooldown(45);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3 ring-1 ring-cyan-400/30">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-wider text-white">EMAIL VERIFICATION</h1>
          <p className="text-xs text-slate-400 mt-1">Enter the 6-digit security OTP sent to:</p>
          <span className="text-xs font-mono text-cyan-400 font-semibold mt-0.5">{email || 'your email'}</span>
        </div>

        {infoMessage && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs mb-5 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs mb-5 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!initialEmail && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@enterprise.com"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block text-center mb-3">6-Digit Verification Code</label>
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-12 h-14 bg-slate-950/90 border border-slate-750 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-center text-xl font-bold font-mono text-cyan-300 rounded-xl outline-none transition-all"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Didn't receive code?</span>
            {resendCooldown > 0 ? (
              <span className="text-slate-500 font-mono text-[11px]">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.join('').length !== 6}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Enter Control Plane'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
            Back to Operator Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
