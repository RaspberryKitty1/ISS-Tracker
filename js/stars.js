const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const layers = [
  { count: 100, speed: 0.02, radius: 0.5, stars: [] },
  { count: 80, speed: 0.05, radius: 1, stars: [] },
  { count: 50, speed: 0.1, radius: 1.5, stars: [] }
];

const nebulaLayers = [];

function generateStarsAndNebula() {
  layers.forEach(layer => {
    layer.stars = [];
    for (let i = 0; i < layer.count; i++) {
      const clusterX = Math.random() * canvas.width;
      const clusterY = Math.random() * canvas.height;
      const clusterRadius = 100 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * clusterRadius;
      layer.stars.push({
        x: clusterX + radius * Math.cos(angle),
        y: clusterY + radius * Math.sin(angle),
        radius: layer.radius + Math.random() * layer.radius,
        alpha: Math.random() * 0.5 + 0.5,
        dx: (Math.random() - 0.5) * layer.speed,
        dy: (Math.random() - 0.5) * layer.speed,
      });
    }
  });

  nebulaLayers.length = 0;
  for (let i = 0; i < 3; i++) {
    nebulaLayers.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8,
      radius: 200 + Math.random() * 300,
      color: ["#489BCF", "#4A61A4", "#2E1B49"][i],
      alpha: 0.15 + Math.random() * 0.2,
      dx: (Math.random() - 0.5) * 0.05,
      dy: (Math.random() - 0.5) * 0.02
    });
  }
}

generateStarsAndNebula();

let lastWidth = canvas.width;
let lastHeight = canvas.height;

function resize() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  const xRatio = newWidth / lastWidth;
  const yRatio = newHeight / lastHeight;

  canvas.width = newWidth;
  canvas.height = newHeight;

  layers.forEach(layer => {
    layer.stars.forEach(star => {
      star.x *= xRatio;
      star.y *= yRatio;
    });
  });

  nebulaLayers.forEach(n => {
    n.x *= xRatio;
    n.y *= yRatio;
  });

  lastWidth = newWidth;
  lastHeight = newHeight;
}

window.addEventListener("resize", resize);

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  nebulaLayers.forEach(n => {
    n.x += n.dx;
    n.y += n.dy;

    if (n.x - n.radius > canvas.width) n.x = -n.radius;
    if (n.x + n.radius < 0) n.x = canvas.width + n.radius;
    if (n.y - n.radius > canvas.height) n.y = -n.radius;
    if (n.y + n.radius < 0) n.y = canvas.height + n.radius;

    const grad = ctx.createRadialGradient(n.x, n.y, n.radius * 0.1, n.x, n.y, n.radius);
    grad.addColorStop(0, `rgba(${hexToRGB(n.color)},${n.alpha})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  layers.forEach(layer => {
    layer.stars.forEach(star => {
      star.alpha += (Math.random() - 0.5) * 0.02;
      star.alpha = Math.max(0.1, Math.min(1, star.alpha));
      if (Math.random() < 0.002) star.alpha = 1;

      star.x += star.dx;
      star.y += star.dy;

      if (star.x - star.radius > canvas.width) star.x = -star.radius;
      if (star.x + star.radius < 0) star.x = canvas.width + star.radius;
      if (star.y - star.radius > canvas.height) star.y = -star.radius;
      if (star.y + star.radius < 0) star.y = canvas.height + star.radius;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
      ctx.fill();
    });
  });

  requestAnimationFrame(draw);
}

draw();

function hexToRGB(hex) {
  const bigint = parseInt(hex.replace("#",""),16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}
