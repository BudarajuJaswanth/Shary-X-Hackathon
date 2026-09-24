import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Heart, Mic, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface OurStoryPageProps {
  onStartConversation?: () => void;
}

export const OurStoryPage: React.FC<OurStoryPageProps> = ({ onStartConversation }) => {
  return (
    <div className="our-story-container">
      {/* Hero Section */}
      <section className="story-hero-section">
        <div className="story-hero-badge">
          <Heart size={14} className="heart-icon" /> OUR STORY & MISSION
        </div>
        <h1 className="story-hero-title">
          Why We Built <span className="highlight-gradient">CITYVOICE AI</span>
        </h1>
        <p className="story-hero-subtitle">
          Because accessing municipal services shouldn't require navigating complex department portals, waiting on hold for helplines, or guessing which city bureau handles a dangerous pothole.
        </p>
      </section>

      {/* The Problem & Vision Cards */}
      <div className="story-grid-section">
        <Card className="story-card problem-card">
          <div className="card-icon-header warning">
            <ShieldAlert size={28} />
          </div>
          <h3>The Challenge Citizens Face</h3>
          <p>
            Every day, millions of citizens encounter broken streetlights, dangerous potholes, overflowing waste bins, or confusing bus routes. Yet, submitting a simple municipal complaint often involves downloading multiple apps, filling out 15-field forms, or making repeated calls during government office hours.
          </p>
        </Card>

        <Card className="story-card vision-card">
          <div className="card-icon-header success">
            <Mic size={28} />
          </div>
          <h3>Our Vision for Autonomous Civic Tech</h3>
          <p>
            We envisioned a world where your city is literally <strong>one natural conversation away</strong>. Speak in your mother tongue—English, Tamil, or Telugu—and let an autonomous civic AI parse your intent, verify details with you, and automatically register actionable municipal tickets.
          </p>
        </Card>
      </div>

      {/* Core Pillars */}
      <section className="story-pillars-section">
        <h2 className="section-heading">Our Core Product Principles</h2>
        <div className="pillars-grid">
          <div className="pillar-item">
            <div className="pillar-number">01</div>
            <h4>Voice & Action First</h4>
            <p>We don't build generic chatbots that spit static web links. CityVoice AI executes actual municipal workflows from start to finish.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-number">02</div>
            <h4>Understands Native Languages</h4>
            <p>Built for India's linguistic diversity. Speak naturally in Tamil, Telugu, or English with regional accent support.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-number">03</div>
            <h4>Complete Transparency (Verify Before Execute)</h4>
            <p>CityVoice AI always confirms extracted locations, landmarks, and priorities with you before creating official municipal records.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-number">04</div>
            <h4>SharyX Open Integration</h4>
            <p>Designed with clean provider adapters so municipal APIs like SharyX can be plugged in seamlessly without rewriting application logic.</p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="story-cta-box">
        <div className="cta-content">
          <Sparkles size={32} className="cta-sparkle" />
          <h2>Ready to experience your city, one conversation away?</h2>
          <p>Try CityVoice AI today and experience action-oriented civic artificial intelligence.</p>
          {onStartConversation && (
            <Button variant="primary" size="lg" onClick={onStartConversation} rightIcon={<ArrowRight size={18} />}>
              Start Conversation Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
