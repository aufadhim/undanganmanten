// Format tanggal ke YYYYMMDDTHHmmssZ (format yang dipakai Google Calendar & .ics)
function toCalendarDate(date, time) {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(':');
    d.setHours(Number(h), Number(m), 0);
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildGoogleCalendarUrl({ title, description, location, date, startTime, endTime }) {
  const start = toCalendarDate(date, startTime || '08:00');
  const end = toCalendarDate(date, endTime || startTime || '10:00');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description || '',
    location: location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Download file .ics langsung (buat user yang pakai Apple Calendar / Outlook, bukan Google)
export function downloadIcsFile({ title, description, location, date, startTime, endTime }) {
  const start = toCalendarDate(date, startTime || '08:00');
  const end = toCalendarDate(date, endTime || startTime || '10:00');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || ''}`,
    `LOCATION:${location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
