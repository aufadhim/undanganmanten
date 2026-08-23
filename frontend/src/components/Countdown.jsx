import { useEffect, useState } from 'react';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar.js';

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

export default function Countdown({ targetDate, eventInfo, accent }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ];

  return (
    <section style={{ textAlign: 'center', marginBottom: 40 }}>
      {timeLeft.done ? (
        <div style={{ fontSize: 14, opacity: 0.8 }}>Hari yang dinanti telah tiba 🎉</div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          {units.map((u) => (
            <div key={u.label}>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{String(u.value).padStart(2, '0')}</div>
              <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'uppercase' }}>{u.label}</div>
            </div>
          ))}
        </div>
      )}

      {eventInfo && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <a
            href={buildGoogleCalendarUrl(eventInfo)}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, padding: '8px 14px', borderRadius: 20, border: `1px solid ${accent || '#ccc'}`, textDecoration: 'none', color: 'inherit' }}
          >
            + Google Calendar
          </a>
          <button
            onClick={() => downloadIcsFile(eventInfo)}
            style={{ fontSize: 12, padding: '8px 14px', borderRadius: 20, border: `1px solid ${accent || '#ccc'}`, background: 'transparent', cursor: 'pointer', color: 'inherit' }}
          >
            + Apple/Outlook
          </button>
        </div>
      )}
    </section>
  );
}
