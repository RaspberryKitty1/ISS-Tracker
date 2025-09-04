let followISS = true;

document.getElementById("follow-btn").onclick = () => {
  followISS = !followISS;
  document.getElementById("follow-btn").textContent =
    `Follow ISS: ${followISS ? "ON" : "OFF"}`;
};
