import { format } from "date-fns";

/**
 * Validate pickup date & time with business rules
 *
 * Rules:
 * - At least 6 hours from current time.
 * - Company closes by 6:00pm daily.
 * - If invalid, return a friendly error message.
 *
 * @param pickupDate Date selected by user
 * @param pickupTime Time selected by user
 * @param fallbackHour Default fallback time for next day (default 12:45pm)
 * @returns {string | null} Error message if invalid, otherwise null
 */
export function validatePickupDateTime(
    pickupDate: Date,
    pickupTime: Date,
    fallbackHour: { hour: number; minute: number } = { hour: 12, minute: 45 }
): string | null {
    const combinedDateTime = new Date(
        pickupDate.getFullYear(),
        pickupDate.getMonth(),
        pickupDate.getDate(),
        pickupTime.getHours(),
        pickupTime.getMinutes(),
        0,
        0
    );

    const now = new Date();
    const nowPlus6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    const closingTime = new Date(
        pickupDate.getFullYear(),
        pickupDate.getMonth(),
        pickupDate.getDate(),
        18, // 6:00pm
        0,
        0,
        0
    );

    const isSameDay =
        pickupDate.getFullYear() === now.getFullYear() &&
        pickupDate.getMonth() === now.getMonth() &&
        pickupDate.getDate() === now.getDate();

    // helper to format datetime → "July 28, 4:10pm"
    const formatDateTime = (date: Date) =>
        format(date, "MMMM d, h:mma");

    // CASE 1: If today but earlier than 6-hour rule
    if (isSameDay && combinedDateTime < nowPlus6Hours) {
        // but check if 6-hour time itself passes 6pm
        if (nowPlus6Hours > closingTime) {
            const nextDay = new Date(now);
            nextDay.setDate(now.getDate() + 1);
            nextDay.setHours(fallbackHour.hour, fallbackHour.minute, 0, 0);

            return `Please select a time after ${formatDateTime(nextDay)}`;
        }
        return `Please select a time after ${formatDateTime(nowPlus6Hours)}`;
    }

    // CASE 2: If selected time today is after 6pm
    if (isSameDay && combinedDateTime > closingTime) {
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        nextDay.setHours(fallbackHour.hour, fallbackHour.minute, 0, 0);

        return `Please select a time after ${formatDateTime(nextDay)}`;
    }

    return null; // ✅ valid
}
