import { ImageResponse } from 'next/og';

export const alt = 'ScriptKaro - Viral Reel & Shorts Script Generator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0D',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Decorative background glow */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '25%',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 122, 26, 0.25) 0%, rgba(255, 77, 0, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Brand Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 24px',
            borderRadius: '9999px',
            background: 'rgba(255, 122, 26, 0.15)',
            border: '1px solid rgba(255, 122, 26, 0.4)',
            color: '#FF7A1A',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: '28px',
          }}
        >
          <span>🔥 AI Scriptwriter for Indian Creators</span>
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}
        >
          <span>Script</span>
          <span style={{ color: '#FF7A1A' }}>Karo</span>
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: '#E5E7EB',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: '36px',
          }}
        >
          Topic do, viral reel script lo. 60 seconds mein.
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#9CA3AF',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            🎯 3-Second Hooks
          </div>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#9CA3AF',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            ⏱️ Scene Timestamps & Visuals
          </div>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#9CA3AF',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            🇮🇳 Roman Hinglish
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
