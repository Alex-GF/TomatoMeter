export const toSubscriptionArr = (plan: string, addons?: { [key: string]: number }) => {
  const arr = [plan];
  if (!addons) return arr;
  Object.entries(addons).forEach(([name, v]) => {
    if (v > 0) arr.push(`${name}X${v}`);
  });
  return arr;
};
