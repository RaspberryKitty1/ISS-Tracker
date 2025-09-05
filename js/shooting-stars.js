function spawnShootingStar() {
  const star = document.createElement("div");
  star.classList.add("shooting-star");

  const xStart = Math.random() * window.innerWidth;
  const yStart = Math.random() * window.innerHeight * 0.6;

  const travelX = 200 + Math.random() * 400;
  const travelY = 100 + Math.random() * 300;

  const xEnd = Math.random() < 0.5 ? xStart - travelX : xStart + travelX;
  const yEnd = yStart + travelY;

  const angle = Math.atan2(yEnd - yStart, xEnd - xStart) + "rad";
  const duration = 0.8 + Math.random() * 1.8;

  const colors = ["#489BCF", "#4A61A4", "#2E1B49", "#FFFFFF"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  star.style.background = `linear-gradient(90deg, ${color}, rgba(255,255,255,0))`;

  star.style.setProperty('--angle', angle);
  star.style.setProperty('--x-end', `${xEnd - xStart}px`);
  star.style.setProperty('--y-end', `${yEnd - yStart}px`);
  star.style.left = `${xStart}px`;
  star.style.top = `${yStart}px`;
  star.style.animationDuration = `${duration}s`;

  document.body.appendChild(star);
  setTimeout(() => star.remove(), duration * 1000);
}

setInterval(() => {
  if (Math.random() < 0.7) spawnShootingStar();
}, 1000 + Math.random() * 3000);