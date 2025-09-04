let trailSegments = [];
const maxTrail = 50;

function addToTrail(lat, lon) {
  const newLatLng = L.latLng(lat, lon);

  if (trailSegments.length > 0) {
    const lastSegment = trailSegments[trailSegments.length - 1];
    const last = lastSegment.getLatLngs()[lastSegment.getLatLngs().length - 1];

    let deltaLon = Math.abs(lon - last.lng);
    if (deltaLon > 180) deltaLon = 360 - deltaLon;

    if (deltaLon > 180) {
      const newSegment = L.polyline([newLatLng], { color: "cyan", weight: 2, opacity: 0.7 }).addTo(map);
      trailSegments.push(newSegment);
    } else {
      lastSegment.addLatLng(newLatLng);
    }
  } else {
    trailSegments.push(L.polyline([newLatLng], { color: "cyan", weight: 2, opacity: 0.7 }).addTo(map));
  }

  // Trim old points
  let totalPoints = trailSegments.reduce((sum, seg) => sum + seg.getLatLngs().length, 0);
  while (totalPoints > maxTrail) {
    const firstSegment = trailSegments[0];
    const points = firstSegment.getLatLngs();
    const excess = totalPoints - maxTrail;

    if (points.length <= excess) {
      map.removeLayer(firstSegment);
      trailSegments.shift();
      totalPoints -= points.length;
    } else {
      firstSegment.setLatLngs(points.slice(excess));
      totalPoints -= excess;
    }
  }
}
