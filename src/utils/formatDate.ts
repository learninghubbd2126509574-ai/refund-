export function formatTrackingDate(dateStr?: string, defaultOffsetMinutes: number = 0): string {
  if (!dateStr) {
    const d = new Date(Date.now() - defaultOffsetMinutes * 60 * 1000);
    return formatNativeDate(d);
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return dateStr;
  }

  return formatNativeDate(parsed);
}

function formatNativeDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 is 12
  const formattedHours = hours.toString().padStart(2, '0');

  return `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm}`;
}
