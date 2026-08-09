export const formatCurrency = (value) => {
  const number = Number(value) || 0;
  const parts = number.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${parts[0]},${parts[1]}`;
};
