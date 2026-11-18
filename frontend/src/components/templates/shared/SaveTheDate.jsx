import { useMemo } from 'react';
import './save-the-date.css';

/** Shared calendar/countdown composition; each template supplies its own class prefix. */
export default function SaveTheDate({ className = '', date, countdown, calendarUrl, buttonLabel = 'Tambahkan ke Kalender', showDateHero = false }) {
  const dateInfo = useMemo(() => {
    const value = date ? new Date(date) : new Date('2026-12-20');
    return { day: value.getDate(), month: value.toLocaleDateString('id-ID', { month: 'long' }), year: value.getFullYear(), monthIndex: value.getMonth() };
  }, [date]);
  const firstDayOffset = new Date(dateInfo.year, dateInfo.monthIndex, 1).getDay();
  const daysInMonth = new Date(dateInfo.year, dateInfo.monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstDayOffset + daysInMonth > 35 ? 42 : 35 }, (_, index) => index - firstDayOffset + 1);
  return <div className={`save-the-date ${className}`}>
    <div className="save-the-date-countdown" data-typography-preserve>{[['Hari', countdown?.days], ['Jam', countdown?.hours], ['Menit', countdown?.mins], ['Detik', countdown?.secs]].map(([label, value]) => <div key={label}><strong>{String(value ?? 0).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>
    {showDateHero && <div className="save-the-date-featured-date" aria-label={`${dateInfo.day} ${dateInfo.month} ${dateInfo.year}`}><strong>{String(dateInfo.day).padStart(2, '0')}</strong><i>·</i><strong>{String(dateInfo.monthIndex + 1).padStart(2, '0')}</strong><i>·</i><strong>{dateInfo.year}</strong></div>}
    <div className="save-the-date-calendar" data-typography-preserve aria-label={`Kalender ${dateInfo.month} ${dateInfo.year}`}><div className="save-the-date-month">{dateInfo.month} {dateInfo.year}</div><div className="save-the-date-week">{['Mi', 'Se', 'Sel', 'Ra', 'Ka', 'Ju', 'Sa'].map((day) => <span key={day}>{day}</span>)}</div><div className="save-the-date-days">{cells.map((day, index) => <span key={index} className={day === dateInfo.day ? 'is-selected' : ''}>{day > 0 && day <= daysInMonth ? day : ''}</span>)}</div></div>
    <a className="save-the-date-button" href={calendarUrl} target="_blank" rel="noreferrer">{buttonLabel}</a>
  </div>;
}
