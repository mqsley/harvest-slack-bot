export function getMondayAndFriday(): { monday: Date; friday: Date } {
    const today = new Date();

    const dayOfWeek = today.getDay();
    const daysToMonday = (1 - dayOfWeek + 7) % 7; // Days to next Monday
    const daysToFriday = (5 - dayOfWeek + 7) % 7; // Days to next Friday

    // Calculate Monday and Friday dates
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);

    const friday = new Date(today);
    friday.setDate(today.getDate() + daysToFriday);

    return { monday, friday };
}
