import React, { useState } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { useToast } from '../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Phone, Lock, ShieldCheck, UserCheck, ArrowRight, Building2, Sparkles } from 'lucide-react';

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
  const [activeCitizen, setActiveCitizen] = useState<{ name: string; phone: string } | null>(null);

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
    const user = { name: 'Verified Citizen', phone: phoneNumber };
    setActiveCitizen(user);
    setIsLoggedIn(true);
    showToast('Successfully logged in to CityVoice AI', 'success');
    if (onSuccessNavigate) onSuccessNavigate();
  };

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialEmail || !officialPassword) {
      showToast('Please provide official credentials', 'warning');
      return;
    }
    const user = { name: 'Municipal Officer', phone: officialEmail };
    setActiveCitizen(user);
    setIsLoggedIn(true);
    showToast('Municipal Officer Portal Authenticated', 'success');
    if (onSuccessNavigate) onSuccessNavigate();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveCitizen(null);
    setStep('PHONE');
    setPhoneNumber('');
    setOtp('');
    showToast('Logged out successfully', 'info');
  };

  if (isLoggedIn && activeCitizen) {
    return (
      <div className="login-page-container">
        <Card className="login-card logged-in-card">
          <CardHeader>
            <div className="avatar-header-box">
              <div className="avatar-large">
                <UserCheck size={36} />
              </div>
              <div>
                <CardTitle>{activeCitizen.name}</CardTitle>
                <p className="user-subtitle">{activeCitizen.phone}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="lbl">Status</span>
                <span className="val text-success">Verified Active Account</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Language Preference</span>
                <span className="val">{language === 'ta' ? 'தமிழ் (Tamil)' : language === 'te' ? 'తెలుగు (Telugu)' : 'English (en-IN)'}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Civic Access Level</span>
                <span className="val">Full Autonomous Action Privileges</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="danger" onClick={handleLogout} className="w-full">
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
          <Sparkles size={14} className="inline-icon" /> Access City Services Instantly
        </span>
        <h2>Welcome to CityVoice AI</h2>
        <p>Log in to seamlessly track your civic complaints, receive automatic SMS resolution alerts, and access personalized city services.</p>
      </div>

      <div className="login-card-wrapper">
        <div className="login-mode-tabs">
          <button
            className={`mode-tab ${loginMode === 'CITIZEN' ? 'active' : ''}`}
            onClick={() => { setLoginMode('CITIZEN'); setStep('PHONE'); }}
          >
            <Phone size={16} /> Citizen Mobile Login
          </button>
          <button
            className={`mode-tab ${loginMode === 'OFFICIAL' ? 'active' : ''}`}
            onClick={() => setLoginMode('OFFICIAL')}
          >
            <Building2 size={16} /> Municipal Official SSO
          </button>
        </div>

        <Card className="login-card">
          {loginMode === 'CITIZEN' ? (
            step === 'PHONE' ? (
              <form onSubmit={handleSendOtp}>
                <CardHeader>
                  <CardTitle>Enter Mobile Number</CardTitle>
                  <p className="card-subtitle">We will send a 4-digit verification code to confirm your phone number.</p>
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
                  <CardTitle>Enter 4-Digit OTP Code</CardTitle>
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
            )
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
