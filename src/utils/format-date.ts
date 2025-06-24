export const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split("T")[0];
};
