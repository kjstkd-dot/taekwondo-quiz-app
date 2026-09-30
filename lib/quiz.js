export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSessionQuestions(bank, count = 20) {
  return shuffle(bank)
    .slice(0, count)
    .map((q) => {
      const order = shuffle([0, 1, 2, 3]);
      return {
        q: q.q,
        c: order.map((i) => q.c[i]),
        a: order.indexOf(q.a),
        note: q.note,
      };
    });
}
