import { useState, useEffect } from 'react';

export function useCountdown(targetDateStr, targetTimeStr) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        if (!targetDateStr) return;

        // If time is provided, append it. If not, default to 08:00
        const datePart = targetDateStr.slice(0, 10);
        const timePart = targetTimeStr ? targetTimeStr : '08:00';
        const targetDate = new Date(`${datePart}T${timePart}:00`);

        if (isNaN(targetDate.getTime())) return;

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((difference / 1000 / 60) % 60),
                    secs: Math.floor((difference / 1000) % 60),
                });
            } else {
                // Countdown finished
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDateStr, targetTimeStr]);

    return timeLeft;
}
