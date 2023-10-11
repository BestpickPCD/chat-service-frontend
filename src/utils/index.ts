import moment from "moment";

export const trimInput = (value: string | number): string | number => {
  return typeof value === "string" ? value.trim() : value;
};

export const onSortTable = (
  array: unknown[],
  key: string,
  direction: "asc" | "desc"
): any =>
  [...array].sort((a: any, b: any) => {
    if (typeof a[key] === "string" && typeof b[key] === "string") {
      if (direction === "asc") {
        return a[key].localeCompare(b[key]);
      }
      return b[key].localeCompare(a[key]);
    } else if (typeof a[key] === "number" && typeof b[key] === "number") {
      if (direction === "asc") {
        return a[key] - b[key];
      }
      return b[key] - a[key];
    }
    return 0;
  });

export const formatToISOString = (
  date: Date,
  option: "from" | "to"
): string => {
  if (option === "to") {
    const endOfDayUtc = moment(date).endOf("day").utc();
    return endOfDayUtc.toISOString();
  }
  const startOfDayUtc = moment(date).startOf("day").utc();
  return startOfDayUtc.toISOString();
};
