function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const l1 = toRad(lat1);
  const l2 = toRad(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(l1) * Math.cos(l2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

function calculateDeliveryTime(distanceKm, trafficFactor = 1.0) {
  // Average urban speed: 25 km/h
  const baseMinutes = (distanceKm / 25) * 60;
  return Math.round(baseMinutes * trafficFactor);
}

function matchSurplusToReceivers(surplusItems, receivers) {
  if (!surplusItems || surplusItems.length === 0 || !receivers || receivers.length === 0) return [];
  
  const totalQuantity = surplusItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const surplusCategories = [...new Set(surplusItems.map(item => item.category))].filter(Boolean);
  const earliestExpiry = Math.min(...surplusItems.map(item => item.hoursUntilExpiry || Infinity));

  const originLat = surplusItems[0].lat || 0;
  const originLng = surplusItems[0].lng || 0;

  const results = receivers.map(receiver => {
    // 1. Proximity score (30%)
    const distance = haversineDistance(originLat, originLng, receiver.lat, receiver.lng);
    let proximityScore = 100 - (distance * 2);
    proximityScore = Math.max(0, Math.min(100, proximityScore));
    const proxWeight = proximityScore * 0.3;

    // 2. Capacity score (25%)
    let capacityScore = 0;
    if (receiver.remainingCapacity >= totalQuantity) {
      capacityScore = 100;
    } else {
      capacityScore = totalQuantity > 0 ? (receiver.remainingCapacity / totalQuantity) * 100 : 0;
    }
    capacityScore = Math.max(0, Math.min(100, capacityScore));
    const capWeight = capacityScore * 0.25;

    // 3. Preference score (25%)
    const preferredCount = surplusCategories.filter(cat => (receiver.preferences || []).includes(cat)).length;
    const prefScore = surplusCategories.length > 0 ? (preferredCount / surplusCategories.length) * 100 : 100;
    const prefWeight = prefScore * 0.25;

    // 4. Urgency score (20%)
    const estTime = calculateDeliveryTime(distance, 1.2);
    const estTimeHrs = estTime / 60;
    let urgScore = 0;
    if (earliestExpiry !== Infinity && earliestExpiry > 0) {
      if (estTimeHrs < earliestExpiry) {
        urgScore = 100 - ((estTimeHrs / earliestExpiry) * 100);
      }
    } else {
      urgScore = 100;
    }
    urgScore = Math.max(0, Math.min(100, urgScore));
    const urgWeight = urgScore * 0.20;

    const matchScore = proxWeight + capWeight + prefWeight + urgWeight;

    return {
      receiverId: receiver.id,
      receiverName: receiver.name,
      matchScore: Math.round(matchScore * 10) / 10,
      breakdown: {
        proximityScore: Math.round(proximityScore),
        capacityScore: Math.round(capacityScore),
        preferenceScore: Math.round(prefScore),
        urgencyScore: Math.round(urgScore)
      },
      estimatedDeliveryTime: estTime
    };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

function optimizeRoute(origin, destinations) {
  const unvisited = [...destinations];
  let currentLoc = { ...origin, id: 'origin' };
  const orderedStops = [];
  const segments = [];
  
  let totalDistance = 0;
  let totalTime = 0;

  while (unvisited.length > 0) {
    let nearestIdx = -1;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dest = unvisited[i];
      const dist = haversineDistance(currentLoc.lat, currentLoc.lng, dest.lat, dest.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited.splice(nearestIdx, 1)[0];
    orderedStops.push(nextStop);
    
    const time = calculateDeliveryTime(minDistance, 1.1);
    
    segments.push({
      from: currentLoc.id || 'origin',
      to: nextStop.id,
      distanceKm: minDistance,
      timeMinutes: time
    });

    totalDistance += minDistance;
    totalTime += time;
    
    currentLoc = nextStop;
  }

  return { orderedStops, totalDistance, totalTime, segments };
}

module.exports = {
  matchSurplusToReceivers,
  optimizeRoute,
  calculateDeliveryTime,
  haversineDistance
};
