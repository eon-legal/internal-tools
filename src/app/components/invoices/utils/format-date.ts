export function formatDateByParams(date: Date | [Date, Date]): string {
  if (Array.isArray(date)) {
    const [first, second] = date;
    return `${simpleformatDate(first)} - ${simpleformatDate(second)}`;
  }
  return simpleformatDate(date as Date);
}

export function simpleformatDate(date: Date): string {
  const day = date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`;
  const month =
    date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
  return `${day}-${month}-${date.getFullYear()}`;
}
