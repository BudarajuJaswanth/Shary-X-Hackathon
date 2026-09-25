import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getSupabaseClient, isSupabaseConfigured } from '../services/database/supabaseClient';
import type { ActiveTabType } from '../components/shell/AppShell';
import {
  Sparkles,
  Mic,
  Heart,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  LogIn,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface MainLandingPageProps {
  onNavigateTab: (tab: ActiveTabType) => void;
}

export const MainLandingPage: React.FC<MainLandingPageProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCitizen, setActiveCitizen] = useState<{
    name: string;
    emailOrPhone: string;
    avatarUrl?: string;
    provider?: string;
  } | null>(null);
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
      } else {
        setIsLoggedIn(false);
        setActiveCitizen(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Supabase in local mode: Simulating Gmail OAuth authentication...', 'info');
      setActiveCitizen({
        name: 'Citizen (Gmail User)',
        emailOrPhone: 'citizen.user@gmail.com',
        provider: 'Google OAuth (Verified)'
      });
      setIsLoggedIn(true);
      showToast('Successfully logged in with Gmail!', 'success');
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

      if (error) throw error;
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize Gmail / Google Sign In', 'error');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setActiveCitizen(null);
    showToast('Signed out of Gmail session', 'info');
  };

  return (
    <div className="main-landing-container">
      {/* ========================================================================= */}
      {/* SECTION 1: WHAT WE ARE GONNA DO (HERO & CAPABILITIES OVERVIEW) */}
      {/* ========================================================================= */}
      <section className="landing-hero-section">
        <div className="hero-top-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>AUTONOMOUS VOICE-FIRST CIVIC ENGINE</span>
        </div>

        <h1 className="landing-main-title">
          Tell Your City What You Need. <br />
          <span className="gradient-highlight">We Turn Voice into Action.</span>
        </h1>

        <p className="landing-hero-description">
          CityVoice AI bridges the gap between citizens and municipal administration. Speak or type in your native language to instantly report potholes, track bus schedules, or request emergency assistance—no complex forms or helpline delays.
        </p>

        {/* Feature Cards Grid (What We Are Gonna Do) */}
        <div className="what-we-do-grid">
          <div className="what-card">
            <div className="card-icon bg-cyan">
              <Mic size={24} />
            </div>
            <h3>1. Voice & Natural Language Intent</h3>
            <p>Speak in English, Tamil, or Telugu. Our AI parses civic complaints, extracts key details, and handles missing information naturally.</p>
          </div>

          <div className="what-card">
            <div className="card-icon bg-rose">
              <AlertTriangle size={24} />
            </div>
            <h3>2. Instant Civic Complaint Tickets</h3>
            <p>Automatically categorizes potholes, garbage overflow, streetlight faults, or water leaks and generates official tracked tickets.</p>
          </div>

          <div className="what-card">
            <div className="card-icon bg-emerald">
              <CheckCircle2 size={24} />
            </div>
            <h3>3. Verification Before Execution</h3>
            <p>Shows a clear draft card for user confirmation before executing backend workflow state changes, ensuring 100% data accuracy.</p>
          </div>

          <div className="what-card">
            <div className="card-icon bg-purple">
              <ShieldCheck size={24} />
            </div>
            <h3>4. Live Status & SLA Tracking</h3>
            <p>Persists ticket details securely in Supabase cloud backend with real-time status updates and department assignment monitoring.</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: OUR STORY & MISSION */}
      {/* ========================================================================= */}
      <section className="landing-story-section">
        <div className="story-header-badge">
          <Heart size={14} className="heart-icon" />
          <span>OUR STORY & VISION</span>
        </div>

        <h2 className="story-section-title">
          Why We Built <span className="text-white">CITYVOICE AI</span>
        </h2>

        <p className="story-intro">
          Accessing basic municipal services shouldn't require downloading four different government apps, waiting on hold with helplines, or navigating confusing department portals.
        </p>

        <div className="story-comparison-grid">
          <Card className="story-box challenge-box">
            <div className="story-box-icon warning">
              <ShieldAlert size={28} />
            </div>
            <h3>The Challenge Citizens Face</h3>
            <p>
              Every day, citizens encounter broken streetlights, dangerous potholes, overflowing waste bins, or confusing transit routes. Yet, submitting a complaint often involves endless form fields, complex bureau choices, and zero feedback.
            </p>
          </Card>

          <Card className="story-box vision-box">
            <div className="story-box-icon success">
              <Mic size={28} />
            </div>
            <h3>Our Vision for Smart Cities</h3>
            <p>
              We envisioned a city that is literally <strong>one natural conversation away</strong>. Speak in your mother tongue, verify extracted details, and watch autonomous AI execute municipal workflows seamlessly.
            </p>
          </Card>
        </div>

        {/* Product Principles */}
        <div className="principles-section">
          <h3 className="principles-title">Our Core Product Principles</h3>
          <div className="principles-grid">
            <div className="principle-card">
              <span className="num">01</span>
              <h4>Action-Oriented AI</h4>
              <p>Not just a static chatbot—CityVoice AI creates and tracks actual municipal records.</p>
            </div>
            <div className="principle-card">
              <span className="num">02</span>
              <h4>Linguistic Inclusion</h4>
              <p>Designed for India's diversity with regional accent support in English, Tamil, and Telugu.</p>
            </div>
            <div className="principle-card">
              <span className="num">03</span>
              <h4>Transparent Confirmation</h4>
              <p>Strict verification step before creating official records so citizens remain in control.</p>
            </div>
            <div className="principle-card">
              <span className="num">04</span>
              <h4>SharyX & Cloud Persistence</h4>
              <p>Powered by Supabase database backend for persistent, end-to-end civic record management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: LOGIN WITH GMAIL & ACCESS MAIN APPLICATION */}
      {/* ========================================================================= */}
      <section className="landing-auth-section" id="login-section">
        <div className="auth-header-badge">
          <LogIn size={14} className="login-icon" />
          <span>CITIZEN ACCESS PORTAL</span>
        </div>

        <h2 className="auth-title">Log In with Gmail to Access Main Interface</h2>
        <p className="auth-subtitle">
          Sign in with your Gmail / Google account to interact with CityVoice AI, register civic complaints, and view your active ticket history.
        </p>

        <div className="auth-card-container">
          <Card className="auth-main-card">
            {isLoggedIn && activeCitizen ? (
              <div className="logged-in-box">
                <div className="user-profile-header">
                  {activeCitizen.avatarUrl ? (
                    <img src={activeCitizen.avatarUrl} alt="Avatar" className="avatar-img" />
                  ) : (
                    <div className="avatar-badge">
                      <UserCheck size={28} />
                    </div>
                  )}
                  <div>
                    <h3 className="user-name">{activeCitizen.name}</h3>
                    <p className="user-email">{activeCitizen.emailOrPhone}</p>
                    <span className="provider-tag">{activeCitizen.provider || 'Google OAuth'}</span>
                  </div>
                </div>

                <div className="logged-in-status-banner">
                  <CheckCircle2 size={18} className="text-success" />
                  <span>Authenticated & Ready to Access Application Interface</span>
                </div>

                <div className="logged-in-cta-row">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full btn-launch-app"
                    onClick={() => onNavigateTab('CONVERSATION')}
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Open Application Main Interface (Voice Assistant)
                  </Button>
                </div>

                <div className="logout-footer">
                  <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut size={14} />}>
                    Sign Out of Gmail
                  </Button>
                </div>
              </div>
            ) : (
              <div className="unauthenticated-box">
                <CardHeader>
                  <CardTitle className="text-xl text-center">Gmail / Google Citizen Login</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <p className="text-muted text-sm text-center mb-6">
                    Use your Google / Gmail account for safe, passwordless authentication.
                  </p>

                  <button
                    type="button"
                    className="btn-google-oauth-large"
                    onClick={handleGoogleSignIn}
                    disabled={isLoadingGoogle}
                  >
                    <svg className="google-svg" width="24" height="24" viewBox="0 0 24 24">
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
                    <span>{isLoadingGoogle ? 'Connecting to Gmail...' : 'Log in using Gmail (Google)'}</span>
                  </button>

                  <div className="divider-line my-6">
                    <span>OR PREVIEW APPLICATION</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onNavigateTab('CONVERSATION')}
                    rightIcon={<ChevronRight size={16} />}
                  >
                    Enter Application Main Interface (Guest Mode)
                  </Button>
                </CardContent>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};
