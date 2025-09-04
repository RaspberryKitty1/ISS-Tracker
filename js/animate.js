function animate() {
  const now = Date.now();
  let t = (now - prevTimestamp) / (nextTimestamp - prevTimestamp);
  t = Math.min(Math.max(t, 0), 1);

  let deltaLon = nextLon - prevLon;
  if (deltaLon > 180) deltaLon -= 360;
  if (deltaLon < -180) deltaLon += 360;

  const lat = prevLat + (nextLat - prevLat) * t;
  const lon = prevLon + deltaLon * t;

  marker.setLatLng([lat, lon]);
  halo.setLatLng([lat, lon]);
  if (followISS) map.setView([lat, lon], map.getZoom(), { animate: false });

  requestAnimationFrame(animate);
}
