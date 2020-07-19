export const truncate = (inp, short) => {
  let end = 30;
  if (!short) end = 120;
  let slice = inp.slice(0, end);
  if (slice === inp) return inp;
  return slice + "...";
}