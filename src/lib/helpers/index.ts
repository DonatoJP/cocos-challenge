export const roundDecimals = (n: number, dn: number = 2) => {
  const dp = 10 ** dn;
  return Math.round(n * dp) / dp;
};
