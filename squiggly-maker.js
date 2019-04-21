function squigglies(lines, width, height, x = 0, y = 0, endpoints = 5) {
  const answers = [];
  for (let i = 0; i < lines; i++) answers.push(i);
  for (let i = 0; i < answers.length - 1; i++) {
    const temp = answers[i];
    const index = Math.floor(Math.random() * (answers.length - i) + i);
    answers[i] = answers[index];
    answers[index] = temp;
  }
  const paths = [];
  const lineSpacing = width / (lines - 1);
  for (let i = 0; i < lines; i++) {
    const points = [[x + i * lineSpacing, y]];
    for (let j = 0; j < endpoints; j++) {
      points.push([x + (Math.random() / 2 + 0.25) * width, y + (j + Math.random()) / endpoints * height]);
      c.fillRect(...points[points.length - 1], 5, 5);
    }
    points.push([x + answers[i] * lineSpacing, y + height]);
    paths.push(points);
  }
  return {
    answers,
    path: new Path2D(paths.map(([p1, ...path]) => {
      return `M${p1[0]} ${p1[1]}Q${p1[0]} ${p1[1]} ` + path.map(([x, y]) => x + ' ' + y).join('T');
    }).join(''))
  };
}
