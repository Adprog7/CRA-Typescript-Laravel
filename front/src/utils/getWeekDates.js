export function getWeekDates(weekOffset = 0) {
  const today = new Date();
  
  today.setDate(today.getDate() + weekOffset * 7);
  
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    days.push({
      label: d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short"
      }),
      date: d
    });
  }

  return days;
}