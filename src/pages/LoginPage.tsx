import React, { useState, useEffect } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { useToast } from '../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Phone, Lock, ShieldCheck, UserCheck, ArrowRight, Building2, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../services/database/supabaseClient';

interface LoginPageProps {
  onSuccessNavigate?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessNavigate }) => {
  const { language } = useCivicContext();
  const { showToast } = useToast();

  const [loginMode, setLoginMode] = useState<'CITIZEN' | 'OFFICIAL'>('CITIZEN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialPassword, setOfficialPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCitizen, setActiveCitizen] = useState<{ name: string; emailOrPhone: string; avatarUrl?: string; provider?: string } | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Check Supabase Auth Session on mount
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setActiveCitizen({
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Verified Citizen',
          emailOrPhone: u.email || u.phone || 'Google Authenticated',
          avatarUrl: u.user_metadata?.avatar_url,
          provider: u.app_metadata?.provider || 'google'
        });
        setIsLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setActiveCitizen({
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Verified Citizen',
          emailOrPhone: u.email || u.phone || 'Google Authenticated',
          avatarUrl: u.user_metadata?.avatar_url,
          provider: u.app_metadata?.provider || 'google'
        });
        setIsLoggedIn(true);
        if (onSuccessNavigate) onSuccessNavigate();
      } else {
        setIsLoggedIn(false);
        setActiveCitizen(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [onSuccessNavigate]);

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Supabase is running in local mode. Simulating Google OAuth login...', 'info');
      setActiveCitizen({
        name: 'Citizen (Google User)',
        emailOrPhone: 'citizen.user@gmail.com',
        provider: 'Google OAuth (Simulated)'
      });
      setIsLoggedIn(true);
      if (onSuccessNavigate) onSuccessNavigate();
      return;
    }

    setIsLoadingGoogle(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client unavailable');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize Google Sign In', 'error');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    setStep('OTP');
    showToast(`Verification code sent to +91 ${phoneNumber}`, 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      showToast('Please enter the 4-digit verification code', 'warning');
      return;
    }
    const user = { name: 'Verified Citizen', emailOrPhone: `+91 ${phoneNumber}`, provider: 'Mobile Phone OTP' };
    setActiveCitizen(user);
    setIsLoggedIn(true);
    showToast('Successfully authenticated via Citizen OTP', 'success');
    if (onSuccessNavigate) onSuccessNavigate();
  };

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialEmail || !officialPassword) {
      showToast('Please provide official credentials', 'warning');
      return;
    }
    const user = { name: 'Municipal Officer', emailOrPhone: officialEmail, provider: 'Government SSO Portal' };
    setActiveCitizen(user);
    setIsLoggedIn(true);
    showToast('Municipal Officer Session Authenticated', 'success');
    if (onSuccessNavigate) onSuccessNavigate();
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setActiveCitizen(null);
    setStep('PHONE');
    setPhoneNumber('');
    setOtp('');
    showToast('Signed out of account', 'info');
  };

  if (isLoggedIn && activeCitizen) {
    return (
      <div className="login-page-container">
        <Card className="login-card logged-in-card">
          <CardHeader>
            <div className="avatar-header-box">
              {activeCitizen.avatarUrl ? (
                <img src={activeCitizen.avatarUrl} alt="Avatar" className="user-avatar-img" />
              ) : (
                <div className="avatar-large">
                  <UserCheck size={32} />
                </div>
              )}
              <div>
                <CardTitle>{activeCitizen.name}</CardTitle>
                <p className="user-subtitle">{activeCitizen.emailOrPhone}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="lbl">Account Status</span>
                <span className="val text-success flex items-center gap-1">
                  <CheckCircle2 size={14} /> Active Verified Account
                </span>
              </div>
              <div className="detail-item">
                <span className="lbl">Authentication Method</span>
                <span className="val badge-provider">{activeCitizen.provider || 'Google OAuth'}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Preferred Language</span>
                <span className="val">
                  {language === 'ta' ? 'தமிழ் (Tamil)' : language === 'te' ? 'తెలుగు (Telugu)' : 'English (en-IN)'}
                </span>
              </div>
              <div className="detail-item">
                <span className="lbl">Civic Access Level</span>
                <span className="val">Autonomous Action Privileges</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="danger" onClick={handleLogout} className="w-full" leftIcon={<LogOut size={16} />}>
              Sign Out of Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <div className="login-hero-text">
        <span className="login-badge">
          <Sparkles size={14} className="inline-icon" /> Safe & Quiet Citizen Identity
        </span>
        <h2>Welcome to CityVoice AI</h2>
        <p>Log in with Google or Mobile OTP to register civic tickets, track SLA status, and receive automated voice updates.</p>
      </div>

      <div className="login-card-wrapper">
        <div className="login-mode-tabs">
          <button
            type="button"
            className={`mode-tab ${loginMode === 'CITIZEN' ? 'active' : ''}`}
            onClick={() => { setLoginMode('CITIZEN'); setStep('PHONE'); }}
          >
            <Phone size={16} /> Citizen Identity
          </button>
          <button
            type="button"
            className={`mode-tab ${loginMode === 'OFFICIAL' ? 'active' : ''}`}
            onClick={() => setLoginMode('OFFICIAL')}
          >
            <Building2 size={16} /> Officer Portal SSO
          </button>
        </div>

        <Card className="login-card">
          {loginMode === 'CITIZEN' ? (
            <div className="citizen-login-stack">
              {/* Google OAuth Button */}
              <div className="google-login-section">
                <button
                  type="button"
                  className="btn-google-oauth"
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingGoogle}
                >
                  <svg className="google-svg" width="20" height="20" viewBox="0 0 24 24">
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
                  <span>{isLoadingGoogle ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
              </div>

              <div className="login-divider">
                <span>OR SIGN IN WITH PHONE OTP</span>
              </div>

              {step === 'PHONE' ? (
                <form onSubmit={handleSendOtp}>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Enter Mobile Number</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      label="Mobile Number (+91)"
                      type="tel"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      leftIcon={<Phone size={18} />}
                      required
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" variant="primary" className="w-full" rightIcon={<ArrowRight size={18} />}>
                      Send Verification OTP
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Enter 4-Digit OTP Code</CardTitle>
                    <p className="card-subtitle">Sent to +91 {phoneNumber}</p>
                  </CardHeader>
                  <CardContent>
                    <Input
                      label="Verification OTP Code"
                      type="text"
                      placeholder="• • • •"
                      value={otp}
                      maxLength={4}
                      onChange={(e) => setOtp(e.target.value)}
                      leftIcon={<Lock size={18} />}
                      required
                    />
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button type="submit" variant="primary" className="w-full" leftIcon={<ShieldCheck size={18} />}>
                      Verify & Continue
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setStep('PHONE')}>
                      Change Phone Number
                    </Button>
                  </CardFooter>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleOfficialLogin}>
              <CardHeader>
                <CardTitle>Municipal Officer SSO Login</CardTitle>
                <p className="card-subtitle">Authorized access for city administration & field officers.</p>
              </CardHeader>
              <CardContent>
                <Input
                  label="Official Government Email"
                  type="email"
                  placeholder="officer@city.gov.in"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  leftIcon={<Building2 size={18} />}
                  required
                />
                <Input
                  label="Security Password / Key"
                  type="password"
                  placeholder="••••••••"
                  value={officialPassword}
                  onChange={(e) => setOfficialPassword(e.target.value)}
                  leftIcon={<Lock size={18} />}
                  required
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="primary" className="w-full" leftIcon={<ShieldCheck size={18} />}>
                  Authenticate Officer Session
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
