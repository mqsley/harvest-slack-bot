export function getMondayAndFriday(date: Date = new Date()): {
  monday: Date;
  friday: Date;
} {
  const currentDay = date.getDay();

  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Sunday (0) wraps around to Monday (-6)
  const daysToFriday = daysToMonday + 4;

  const monday = new Date(date);
  monday.setDate(date.getDate() + daysToMonday);

  const friday = new Date(date);
  friday.setDate(date.getDate() + daysToFriday);

  monday.setHours(0, 0, 0, 0);
  friday.setHours(0, 0, 0, 0);

  return { monday, friday };
}
