import React, { useEffect, useRef } from 'react';
import { useCivicContext } from '../context/CivicContext';
import { TRANSLATIONS } from '../services/translations';
import { Mic, MicOff, Volume2, Loader2, Radio } from 'lucide-react';

export const VoiceSphere: React.FC = () => {
  const { voiceState, toggleListening, transcript, language, stopSpeaking } = useCivicContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const t = TRANSLATIONS[language];

  // Audio wave canvas animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (voiceState === 'LISTENING' || voiceState === 'SPEAKING') {
        step += 0.08;
        const waves = 4;
        const color = voiceState === 'LISTENING' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(16, 185, 129, 0.4)';

        for (let i = 0; i < waves; i++) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 - i * 0.4;
          const amplitude = (15 + i * 8) * (voiceState === 'LISTENING' ? 1.2 : 0.8);
          const frequency = 0.02 + i * 0.005;

          for (let x = 0; x < canvas.width; x += 3) {
            const y =
              canvas.height / 2 +
              Math.sin(x * frequency + step + i) * amplitude * Math.sin((x / canvas.width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [voiceState]);

  const getStatusBadge = () => {
    switch (voiceState) {
      case 'LISTENING':
        return (
          <div className="status-badge state-listening">
            <Radio className="pulse-icon" size={14} />
            <span>{t.listening}</span>
          </div>
        );
      case 'UNDERSTANDING':
        return (
          <div className="status-badge state-understanding">
            <Loader2 className="spin-icon" size={14} />
            <span>{t.understanding}</span>
          </div>
        );
      case 'SPEAKING':
        return (
          <div
            className="status-badge state-speaking clickable"
            title="Click to stop voice playback"
            onClick={stopSpeaking}
          >
            <Volume2 className="bounce-icon" size={14} />
            <span>{t.speaking}</span>
          </div>
        );
      default:
        return (
          <div className="status-badge state-idle">
            <span>{t.micHint}</span>
          </div>
        );
    }
  };

  return (
    <div className={`voice-sphere-wrapper state-${voiceState.toLowerCase()}`}>
      <canvas ref={canvasRef} className="voice-canvas" width={320} height={120} />

      <div className="sphere-mic-container">
        <button
          className={`mic-button ${voiceState.toLowerCase()}`}
          onClick={toggleListening}
          aria-label="Toggle Voice Input"
        >
          <div className="mic-rings">
            <span className="ring ring-1"></span>
            <span className="ring ring-2"></span>
            <span className="ring ring-3"></span>
          </div>

          <div className="mic-icon-inner">
            {voiceState === 'LISTENING' ? (
              <MicOff size={36} className="mic-svg active" />
            ) : voiceState === 'UNDERSTANDING' ? (
              <Loader2 size={36} className="mic-svg spin" />
            ) : voiceState === 'SPEAKING' ? (
              <Volume2 size={36} className="mic-svg speaking" />
            ) : (
              <Mic size={36} className="mic-svg" />
            )}
          </div>
        </button>
      </div>

      {/* Live Transcript Display */}
      {transcript && (
        <div className="live-transcript-box">
          <p className="transcript-label">Live Speech Recognized:</p>
          <p className="transcript-text">"{transcript}"</p>
        </div>
      )}

      {/* Status Bar */}
      <div className="sphere-status">{getStatusBadge()}</div>
    </div>
  );
};
