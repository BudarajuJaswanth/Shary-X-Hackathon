import React, { useState } from 'react';
import { useCivicContext } from '../../context/CivicContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  MapPin,
  Sparkles,
  AlertTriangle,
  Bus,
  ShieldCheck,
  Send,
  VolumeX,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Radio,
  FileCheck
} from 'lucide-react';

interface CitizenHomeExperienceProps {
  onNavigateTab?: (tab: 'CONVERSATION' | 'TRACKER' | 'ADMIN' | 'OUR_STORY' | 'LOGIN') => void;
}

export const CitizenHomeExperience: React.FC<CitizenHomeExperienceProps> = ({ onNavigateTab }) => {
  const {
    language,
    voiceState,
    toggleListening,
    transcript,
    sendTextMessage,
    stopSpeaking,
    complaints,
    trackTicket
  } = useCivicContext();

  const [textInput, setTextInput] = useState('');
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true);
  const [locationName] = useState('Guindy, Chennai (GPS Active)');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'ta') {
      if (hour < 12) return 'காலை வணக்கம், குடிமக்களே';
      if (hour < 17) return 'மதிய வணக்கம், குடிமக்களே';
      return 'மாலை வணக்கம், குடிமக்களே';
    }
    if (language === 'te') {
      if (hour < 12) return 'শুভ உதயம், పౌరులకు స్వాగతం';
      if (hour < 17) return 'శుభ మధ్యాహ్నం, పౌరులకు స్వాగతం';
      return 'శుభ సాయంత్రం, పౌరులకు స్వాగతం';
    }
    if (hour < 12) return 'Good Morning, Citizen';
    if (hour < 17) return 'Good Afternoon, Citizen';
    return 'Good Evening, Citizen';
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  const handleQuickPromptClick = (promptText: string) => {
    sendTextMessage(promptText);
  };

  // Render 8-State Visualizer Banners
  const renderVoiceStateVisualizer = () => {
    switch (voiceState) {
      case 'LISTENING':
        return (
          <div className="voice-state-banner state-listening" role="status">
            <Radio size={16} className="pulse-icon" />
            <span>Listening... Speak your request naturally</span>
          </div>
        );
      case 'TRANSCRIBING':
        return (
          <div className="voice-state-banner state-processing" role="status">
            <Loader2 size={16} className="spin-icon" />
            <span>Converting speech audio to text...</span>
          </div>
        );
      case 'UNDERSTANDING':
        return (
          <div className="voice-state-banner state-processing" role="status">
            <Loader2 size={16} className="spin-icon" />
            <span>Understanding your civic request...</span>
          </div>
        );
      case 'CONFIRMING':
        return (
          <div className="voice-state-banner state-confirming" role="status">
            <FileCheck size={16} />
            <span>Verification required — Please review your details below</span>
          </div>
        );
      case 'EXECUTING':
        return (
          <div className="voice-state-banner state-processing" role="status">
            <Loader2 size={16} className="spin-icon" />
            <span>Submitting municipal ticket to city backend...</span>
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="voice-state-banner state-speaking" role="status">
            <CheckCircle2 size={16} />
            <span>Request processed successfully!</span>
          </div>
        );
      case 'SPEAKING':
        return (
          <div
            className="voice-state-banner state-speaking clickable"
            role="status"
            title="Click to stop audio response"
            onClick={stopSpeaking}
          >
            <Volume2 size={16} className="bounce-icon" />
            <span>Reading response... (Tap to pause audio)</span>
          </div>
        );
      case 'ERROR':
        return (
          <div className="voice-state-banner state-error" role="status">
            <XCircle size={16} />
            <span>Microphone input issue — You can type your request below</span>
          </div>
        );
      case 'IDLE':
      default:
        return (
          <div className="voice-state-banner state-idle" role="status">
            <Sparkles size={16} />
            <span>Tap the microphone to speak to CityVoice AI</span>
          </div>
        );
    }
  };

  return (
    <div className={`citizen-home-container ${highContrast ? 'high-contrast-mode' : ''} ${largeText ? 'large-text-mode' : ''}`}>
      <div className="utility-bar">
        <div className="location-status-chip" title="Current detected location for civic services">
          <MapPin size={14} className="location-icon" />
          <span>{locationName}</span>
        </div>

        <div className="accessibility-controls-group">
          <button
            type="button"
            className={`access-btn ${highContrast ? 'active' : ''}`}
            title="Toggle High Contrast Mode"
            aria-pressed={highContrast}
            onClick={() => setHighContrast(!highContrast)}
          >
            <Eye size={14} /> High Contrast
          </button>

          <button
            type="button"
            className={`access-btn ${largeText ? 'active' : ''}`}
            title="Toggle Large Text Mode"
            aria-pressed={largeText}
            onClick={() => setLargeText(!largeText)}
          >
            A+ Large Text
          </button>

          <button
            type="button"
            className={`access-btn ${audioFeedbackEnabled ? 'active' : ''}`}
            title="Toggle Speech Audio Feedback"
            aria-pressed={audioFeedbackEnabled}
            onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
          >
            {audioFeedbackEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Audio
          </button>
        </div>
      </div>

      <div className="civic-desk-hero">
        <div className="hero-greeting-box">
          <h2 className="greeting-title">{getGreeting()}</h2>
          <h1 className="hero-main-title">Tell your city what you need.</h1>
          <p className="hero-sub-prompt">How can I help you today?</p>
        </div>

        <div className="central-voice-desk">
          <div className={`voice-sphere-button-wrapper state-${voiceState.toLowerCase()}`}>
            <button
              type="button"
              className={`hero-voice-button ${voiceState.toLowerCase()}`}
              onClick={toggleListening}
              aria-pressed={voiceState === 'LISTENING'}
              aria-label={
                voiceState === 'LISTENING'
                  ? 'Stop listening'
                  : voiceState === 'SPEAKING'
                  ? 'Stop speaking'
                  : 'Start speaking to CityVoice AI'
              }
            >
              <div className="mic-glow-rings">
                <span className="glow-ring ring-1" />
                <span className="glow-ring ring-2" />
                <span className="glow-ring ring-3" />
              </div>

              <div className="mic-center-icon">
                {voiceState === 'LISTENING' ? (
                  <MicOff size={44} className="mic-svg active" />
                ) : voiceState === 'TRANSCRIBING' || voiceState === 'UNDERSTANDING' || voiceState === 'EXECUTING' ? (
                  <Loader2 size={44} className="mic-svg spin" />
                ) : voiceState === 'SPEAKING' ? (
                  <Volume2 size={44} className="mic-svg speaking" />
                ) : (
                  <Mic size={44} className="mic-svg" />
                )}
              </div>
            </button>

            <span className="mic-touch-label">
              {voiceState === 'LISTENING'
                ? 'Tap to stop listening'
                : voiceState === 'SPEAKING'
                ? 'Tap to pause audio'
                : 'Tap to speak'}
            </span>
          </div>

          {renderVoiceStateVisualizer()}

          {transcript && (
            <div className="live-transcript-card">
              <span className="transcript-tag">Live Speech:</span>
              <p className="transcript-content">"{transcript}"</p>
            </div>
          )}

          <div className="example-prompts-row">
            <span className="example-label">Or try asking:</span>
            <div className="prompts-chips-wrapper">
              <Button
                variant="ghost"
                size="sm"
                className="example-chip"
                onClick={() => handleQuickPromptClick('Report a pothole near Anna Nagar bus stand')}
              >
                🕳️ Report a pothole
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="example-chip"
                onClick={() => handleQuickPromptClick('Where is my bus to Central Station?')}
              >
                🚌 Where is my bus?
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="example-chip"
                onClick={() => handleQuickPromptClick('Find a nearby hospital emergency')}
              >
                🚑 Find a nearby hospital
              </Button>
            </div>
          </div>

          <form onSubmit={handleTextSubmit} className="hero-text-fallback-form">
            <input
              type="text"
              className="hero-text-input" id="fallback-input" aria-label="Request input"
              placeholder={
                language === 'ta'
                  ? 'அல்லது உங்கள் செய்தியை இங்கு தட்டச்சு செய்யவும்...'
                  : language === 'te'
                  ? 'లేదా మీ అభ్యర్థనను ఇక్కడ నమోదు చేయండి...'
                  : 'Or type your request here (e.g. Broken streetlight on 100ft road)...'
              }
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button
              type="submit"
              className="hero-send-btn"
              disabled={!textInput.trim()}
              aria-label="Send text request"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <section className="quick-actions-section" aria-label="Quick Civic Actions">
        <h3 className="section-title">Quick Civic Actions</h3>
        <div className="quick-actions-grid">
          <Card
            interactive
            className="action-card card-problem"
            onClick={() => handleQuickPromptClick('Report a problem with garbage or pothole')}
          >
            <div className="card-icon-box bg-primary">
              <AlertTriangle size={24} />
            </div>
            <h4>Report a Problem</h4>
            <p>Potholes, garbage overflow, streetlight fault, water leaks</p>
            <span className="card-action-link">
              Start Report <ChevronRight size={14} />
            </span>
          </Card>

          <Card
            interactive
            className="action-card card-track"
            onClick={() => onNavigateTab && onNavigateTab('TRACKER')}
          >
            <div className="card-icon-box bg-secondary">
              <ShieldCheck size={24} />
            </div>
            <h4>Track Request</h4>
            <p>Check ticket status, resolution SLAs, and assigned officers</p>
            <span className="card-action-link">
              View Tracker <ChevronRight size={14} />
            </span>
          </Card>

          <Card
            interactive
            className="action-card card-transport"
            onClick={() => handleQuickPromptClick('When is the next bus to Central Station?')}
          >
            <div className="card-icon-box bg-info">
              <Bus size={24} />
            </div>
            <h4>Find Transport</h4>
            <p>Live bus schedules, route stops, vehicle ETAs, and fares</p>
            <span className="card-action-link">
              Find Bus <ChevronRight size={14} />
            </span>
          </Card>

          <Card
            interactive
            className="action-card card-emergency"
            onClick={() => handleQuickPromptClick('Emergency medical assistance 108 ambulance')}
          >
            <div className="card-icon-box bg-success">
              <CheckCircle2 size={24} />
            </div>
            <h4>Emergency Help</h4>
            <p>Direct dispatch lines for 108 Ambulance, 100 Police, 101 Fire</p>
            <span className="card-action-link">
              Emergency Services <ChevronRight size={14} />
            </span>
          </Card>
        </div>
      </section>

      <section className="recent-requests-section" aria-label="Recent Requests">
        <div className="section-header">
          <h3>Your Recent Municipal Requests</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab && onNavigateTab('TRACKER')}
            rightIcon={<ChevronRight size={14} />}
          >
            View All ({complaints.length})
          </Button>
        </div>

        <div className="recent-requests-list">
          {complaints.slice(0, 3).map((item) => (
            <Card key={item.id} className="recent-ticket-card">
              <div className="ticket-top-row">
                <div className="ticket-id-group">
                  <ShieldCheck size={16} className="text-cyan" />
                  <span className="ticket-code">{item.ticketId}</span>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <h4 className="ticket-title">{item.title}</h4>
              <p className="ticket-location">
                <MapPin size={12} className="inline-icon" /> {item.location}
              </p>

              <div className="ticket-footer-row">
                <span className="sla-text">
                  <Clock size={12} className="inline-icon" /> SLA Resolution: {item.estimatedResolutionHours} hrs
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    trackTicket(item.ticketId);
                    if (onNavigateTab) onNavigateTab('TRACKER');
                  }}
                >
                  Check Status
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
