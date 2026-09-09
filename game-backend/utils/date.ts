export function isNewDay(lastDate, currentDate = new Date()) {
  if (!lastDate) return true;

  const last = new Date(lastDate);
  const current = new Date(currentDate);

  return (
    last.getFullYear() !== current.getFullYear() ||
    last.getMonth() !== current.getMonth() ||
    last.getDate() !== current.getDate()
  );
}