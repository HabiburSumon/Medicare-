// Consistent doctor avatar mapping based on doctor ID
// Each doctor gets a unique, permanent avatar based on their database ID

const doctorImages = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',  // Male doctor 1
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',  // Female doctor 1
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop',  // Male doctor 2
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop',  // Male doctor 3
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop',  // Female doctor 2
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',  // Male doctor 4
  'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=200&h=200&fit=crop',  // Female doctor 3
  'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=200&h=200&fit=crop',  // Male doctor 5
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop',  // Female doctor 4
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&h=200&fit=crop',  // Male doctor 6
];

// Simple hash function to convert doctor ID to a consistent index
function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getDoctorImage(doctorId: string): string {
  const index = hashId(doctorId) % doctorImages.length;
  return doctorImages[index];
}

export default doctorImages;