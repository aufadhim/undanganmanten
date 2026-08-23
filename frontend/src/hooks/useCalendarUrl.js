import { useMemo } from 'react';

export function useCalendarUrl(eventDateStr, startTimeStr, endTimeStr, venueName, coupleNameTitle, detailsText) {
    const calendarUrl = useMemo(() => {
        if (!eventDateStr) return '#';

        const datePart = eventDateStr.slice(0, 10);
        const startTarget = new Date(`${datePart}T${startTimeStr || '08:00'}:00`);
        
        if (isNaN(startTarget.getTime())) return '#';
        
        const start = startTarget.toISOString().replace(/-|:|\.\d+/g, '');
        
        let endTarget;
        if (endTimeStr) {
            endTarget = new Date(`${datePart}T${endTimeStr}:00`);
        } else {
            // Default to 2 hours duration
            endTarget = new Date(startTarget.getTime() + 2 * 60 * 60 * 1000);
        }
        
        const end = endTarget.toISOString().replace(/-|:|\.\d+/g, '');
        
        const title = encodeURIComponent(coupleNameTitle || 'Wedding Ceremony');
        const details = encodeURIComponent(detailsText || 'You are invited to our wedding ceremony.');
        const location = encodeURIComponent(venueName || '');
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    }, [eventDateStr, startTimeStr, endTimeStr, venueName, coupleNameTitle, detailsText]);

    return calendarUrl;
}
