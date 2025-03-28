/**
 * Formats a single date into a string representation in the format `dd-MM-yyyy`.
 * Returns 'Invalid Date' if the date is invalid.
 */
export function simpleformatDate(date: Date): string {
  if (isNaN(date.getTime())) {
    return ''; // Changed from 'NaN' to 'Invalid Date'
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

/**
 * Formats a date or date range, handling invalid dates gracefully.
 */
export function formatDateByParams(date: Date | [Date, Date] | null): string {
  if(!date) return '';
  if (Array.isArray(date)) {
    const [first, second] = date;
    if(!simpleformatDate(first) && !simpleformatDate(second)) return '';
    return `${simpleformatDate(first)} - ${simpleformatDate(second)}`;
  }
  return simpleformatDate(date);
}