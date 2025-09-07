// canvas setup
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// starfield layers
const layers = [
  { count: 360, speed: 0.01, radius: 0.3, stars: [] },
  { count: 240, speed: 0.04, radius: 0.7, stars: [] },
  { count: 140, speed: 0.1, radius: 1.2, stars: [] }
];

const nebulaLayers = [];
const starColors = ["#FFFFFF", "#FFE9C4", "#D4FBFF", "#FFD1DC"];

// shooting stars
const shootingStars = [];

// generate stars & nebula
function generateStarsAndNebula() {
  layers.forEach(layer => {
    layer.stars = [];
    for (let i = 0; i < layer.count; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * layer.radius + 0.2;
      const alpha = Math.random() * 0.8 + 0.2;
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      layer.stars.push({ x, y, radius, alpha, color, dx: (Math.random() - 0.5) * layer.speed, dy: (Math.random() - 0.5) * layer.speed });
    }
  });

  nebulaLayers.length = 0;
  for (let i = 0; i < 3; i++) {
    nebulaLayers.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8,
      radius: 250 + Math.random() * 300,
      colors: ["#489BCF", "#4A61A4", "#2E1B49"],
      alpha: 0.1 + Math.random() * 0.15,
      dx: (Math.random() - 0.5) * 0.02,
      dy: (Math.random() - 0.5) * 0.01
    });
  }
}

generateStarsAndNebula();

let lastWidth = canvas.width;
let lastHeight = canvas.height;

// resize
function resize() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  const xRatio = newWidth / lastWidth;
  const yRatio = newHeight / lastHeight;

  canvas.width = newWidth;
  canvas.height = newHeight;

  layers.forEach(layer => layer.stars.forEach(star => { star.x *= xRatio; star.y *= yRatio; }));
  nebulaLayers.forEach(n => { n.x *= xRatio; n.y *= yRatio; });

  lastWidth = newWidth;
  lastHeight = newHeight;
}

window.addEventListener("resize", resize);

// spawn shooting star
function spawnShootingStar() {
  const xStart = Math.random() * canvas.width;
  const yStart = Math.random() * canvas.height * 0.6;

  const travelX = 200 + Math.random() * 400;
  const travelY = 100 + Math.random() * 300;

  const xEnd = Math.random() < 0.5 ? xStart - travelX : xStart + travelX;
  const yEnd = yStart + travelY;

  const angle = Math.atan2(yEnd - yStart, xEnd - xStart);
  const speed = 8 + Math.random() * 6;

  const colors = ["#489BCF","#4A61A4","#2E1B49","#FFFFFF"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  shootingStars.push({ x: xStart, y: yStart, angle, speed, color, length: 8 + Math.random() * 8 });
}

// shooting star interval
setInterval(() => {
  if (!document.hidden && Math.random() < 0.7) spawnShootingStar();
}, 2000 + Math.random() * 3000);


// draw shooting stars
function drawShootingStars() {
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    const dx = Math.cos(s.angle) * s.speed;
    const dy = Math.sin(s.angle) * s.speed;

    const grad = ctx.createLinearGradient(s.x, s.y, s.x - dx * s.length, s.y - dy * s.length);
    grad.addColorStop(0, s.color);
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = s.color;

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - dx * s.length, s.y - dy * s.length);
    ctx.stroke();

    // bright head
    ctx.shadowBlur = 0;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    ctx.fill();

    s.x += dx;
    s.y += dy;

    if (s.x < -50 || s.x > canvas.width + 50 || s.y > canvas.height + 50) shootingStars.splice(i, 1);
  }
}

// convert hex to rgb
function hexToRGB(hex){
  const bigint=parseInt(hex.replace("#",""),16);
  const r=(bigint>>16)&255;
  const g=(bigint>>8)&255;
  const b=bigint&255;
  return `${r},${g},${b}`;
}

// main draw loop
function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // nebula
  nebulaLayers.forEach(n => {
    n.x += n.dx; n.y += n.dy;
    if(n.x-n.radius>canvas.width)n.x=-n.radius;
    if(n.x+n.radius<0)n.x=canvas.width+n.radius;
    if(n.y-n.radius>canvas.height)n.y=-n.radius;
    if(n.y+n.radius<0)n.y=canvas.height+n.radius;

    const grad = ctx.createRadialGradient(n.x,n.y,n.radius*0.1,n.x,n.y,n.radius);
    grad.addColorStop(0,`rgba(${hexToRGB(n.colors[0])},${n.alpha})`);
    grad.addColorStop(0.5,`rgba(${hexToRGB(n.colors[1])},${n.alpha*0.7})`);
    grad.addColorStop(1,`rgba(${hexToRGB(n.colors[2])},0)`);

    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  });

  // stars
  layers.forEach(layer => layer.stars.forEach(star => {
    star.alpha += (Math.random()-0.5)*0.02;
    star.alpha = Math.max(0.1, Math.min(1,star.alpha));
    star.x += star.dx; star.y += star.dy;

    if(star.x-star.radius>canvas.width) star.x=-star.radius;
    if(star.x+star.radius<0) star.x=canvas.width+star.radius;
    if(star.y-star.radius>canvas.height) star.y=-star.radius;
    if(star.y+star.radius<0) star.y=canvas.height+star.radius;

    ctx.beginPath();
    ctx.arc(star.x,star.y,star.radius,0,Math.PI*2);
    ctx.fillStyle=`rgba(${hexToRGB(star.color)},${star.alpha})`;
    ctx.fill();
  }));

  // shooting stars
  drawShootingStars();

  // drifting planet
  const time = Date.now()*0.0001;
  const planetX = canvas.width*0.8 + Math.sin(time)*50;
  const planetY = canvas.height*0.3 + Math.cos(time)*30;
  const planetRadius = 30;

  const planetGrad = ctx.createRadialGradient(planetX,planetY,planetRadius*0.2,planetX,planetY,planetRadius);
  planetGrad.addColorStop(0,"rgba(200,150,255,0.6)");
  planetGrad.addColorStop(1,"rgba(0,0,0,0)");

  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(planetX,planetY,planetRadius,0,Math.PI*2);
  ctx.fill();

  requestAnimationFrame(draw);
}

draw();
