let trailSegments = [];
const maxTrail = 100; // total number of points to keep in trail

function addToTrail(lat, lon) {
  const newLatLng = L.latLng(lat, lon);

  if (trailSegments.length > 0) {
    const lastSegment = trailSegments[trailSegments.length - 1];
    const last = lastSegment.getLatLngs()[lastSegment.getLatLngs().length - 1];

    // --- Detect antimeridian crossing ---
    let rawDelta = Math.abs(lon - last.lng);
    if (rawDelta > 180) {
      // 🚫 Don't draw across the map — start a new segment
      const newSegment = L.polyline([newLatLng], {
        color: "cyan",
        weight: 2,
        opacity: 0.7
      }).addTo(map);
      trailSegments.push(newSegment);
    } else {
      // ✅ Normal continuation
      lastSegment.addLatLng(newLatLng);
    }
  } else {
    // First trail point → start a new segment
    trailSegments.push(
      L.polyline([newLatLng], {
        color: "cyan",
        weight: 2,
        opacity: 0.7
      }).addTo(map)
    );
  }

  // --- Trim old points so trail never exceeds maxTrail ---
  let totalPoints = trailSegments.reduce(
    (sum, seg) => sum + seg.getLatLngs().length,
    0
  );

  while (totalPoints > maxTrail) {
    const firstSegment = trailSegments[0];
    const points = firstSegment.getLatLngs();
    const excess = totalPoints - maxTrail;

    if (points.length <= excess) {
      // Remove entire segment if it's smaller than excess
      map.removeLayer(firstSegment);
      trailSegments.shift();
      totalPoints -= points.length;
    } else {
      // Trim points from the first segment
      firstSegment.setLatLngs(points.slice(excess));
      totalPoints -= excess;
    }
  }
}

