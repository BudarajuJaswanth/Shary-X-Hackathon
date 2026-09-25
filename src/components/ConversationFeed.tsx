import React, { useRef, useEffect, useState } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { MobilityWidget } from './MobilityWidget';
import { EmergencyWidget } from './EmergencyWidget';
import { Send, Volume2, User, Bot, Copy, Check, ShieldCheck, Clock, Mic, MicOff, Radio, RefreshCw } from 'lucide-react';

export const ConversationFeed: React.FC = () => {
  const {
    messages,
    sendTextMessage,
    speakText,
    language,
    voiceState,
    toggleListening,
    transcript,
    isContinuousVoiceMode,
    toggleContinuousVoiceMode
  } = useCivicContext();
  const [textInput, setTextInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="conversation-feed-container">
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble-wrapper ${msg.sender.toLowerCase()}`}>
            <div className="avatar">
              {msg.sender === 'CITIZEN' ? (
                <User size={18} className="avatar-icon citizen" />
              ) : (
                <Bot size={18} className="avatar-icon bot" />
              )}
            </div>

            <div className="message-content-card">
              <div className="message-header">
                <span className="sender-name">
                  {msg.sender === 'CITIZEN' ? 'Citizen' : 'CityVoice AI'}
                </span>
                <span className="msg-time">{msg.timestamp}</span>

                {msg.sender === 'CITYVOICE_AI' && (
                  <button
                    className="speak-msg-btn"
                    title="Listen to response"
                    onClick={() => speakText(msg.text)}
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>

              <div className="message-body">
                {/* Format simple text markdown */}
                <div
                  className="formatted-text"
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code className="ticket-code">$1</code>')
                      .replace(/\n/g, '<br/>')
                  }}
                />

                {/* Ticket Data Card */}
                {msg.ticketData && (
                  <div className="ticket-card-embedded">
                    <div className="ticket-card-header">
                      <div className="ticket-id-badge">
                        <ShieldCheck size={16} />
                        <span>{msg.ticketData.ticketId}</span>
                        <button
                          className="copy-btn"
                          title="Copy Ticket ID"
                          onClick={() => copyToClipboard(msg.ticketData!.ticketId)}
                        >
                          {copiedId === msg.ticketData.ticketId ? (
                            <Check size={14} className="copied" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      <span className={`status-pill status-${msg.ticketData.status.toLowerCase()}`}>
                        {msg.ticketData.status}
                      </span>
                    </div>

                    <div className="ticket-card-grid">
                      <div>
                        <span className="label">Category:</span>
                        <span className="val">{msg.ticketData.category}</span>
                      </div>
                      <div>
                        <span className="label">Location:</span>
                        <span className="val">{msg.ticketData.location}</span>
                      </div>
                      <div>
                        <span className="label">Assigned Department:</span>
                        <span className="val">{msg.ticketData.assignedDepartment}</span>
                      </div>
                      <div>
                        <span className="label">Resolution SLA:</span>
                        <span className="val SLA">
                          <Clock size={12} className="inline-icon" /> {msg.ticketData.estimatedResolutionHours} Hours
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobility Route / Stops / Bus Status Cards */}
                {(msg.mobilityRouteData || msg.mobilityStopsData || msg.mobilityVehicleData || (msg.mobilityData && msg.mobilityData.length > 0)) && (
                  <MobilityWidget
                    routes={msg.mobilityData}
                    routeData={msg.mobilityRouteData}
                    stopsData={msg.mobilityStopsData}
                    vehicleData={msg.mobilityVehicleData}
                  />
                )}

                {/* Emergency Facilities / Contacts Card */}
                {((msg.emergencyFacilityData && msg.emergencyFacilityData.length > 0) || (msg.emergencyData && msg.emergencyData.length > 0)) && (
                  <EmergencyWidget contacts={msg.emergencyData} facilities={msg.emergencyFacilityData} />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={feedEndRef} />
      </div>

      {/* Live Transcript / Voice State Indicator */}
      {transcript ? (
        <div className="feed-transcript-banner">
          <Radio size={14} className="pulse-icon text-cyan" />
          <span>Speech Input: "{transcript}"</span>
        </div>
      ) : voiceState === 'LISTENING' ? (
        <div className="feed-transcript-banner listening">
          <Radio size={14} className="pulse-icon text-cyan" />
          <span>[LISTENING] 1-on-1 Voice Mode Active... Speak naturally into your mic</span>
        </div>
      ) : null}

      {/* Interactive Sticky Voice & Text Input Bar */}
      <div className="feed-interactive-bar">
        {/* Toggle Continuous 1-on-1 Mode */}
        <button
          type="button"
          className={`continuous-mode-toggle ${isContinuousVoiceMode ? 'active' : ''}`}
          onClick={toggleContinuousVoiceMode}
          title="Toggle 1-on-1 Continuous Voice Conversation Mode"
        >
          <RefreshCw size={13} className={isContinuousVoiceMode ? 'spin-subtle' : ''} />
          <span>1-on-1 Voice Mode: {isContinuousVoiceMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Inline Mic Button */}
        <button
          type="button"
          className={`inline-mic-btn ${voiceState.toLowerCase()}`}
          onClick={toggleListening}
          title={voiceState === 'LISTENING' ? 'Stop listening' : 'Start 1-on-1 voice conversation'}
        >
          {voiceState === 'LISTENING' ? (
            <MicOff size={18} className="mic-active-pulse" />
          ) : (
            <Mic size={18} />
          )}
        </button>

        {/* Fallback Text Input Form */}
        <form onSubmit={handleSubmit} className="text-input-form-inline">
          <input
            type="text"
            className="chat-text-input"
            placeholder={
              language === 'ta'
                ? 'அல்லது உங்கள் செய்தியை இங்கு தட்டச்சு செய்யவும்...'
                : language === 'te'
                ? 'లేదా మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...'
                : 'Speak into mic or type your message here...'
            }
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!textInput.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
