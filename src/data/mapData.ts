export const samplePins = [
  {
    id: '1',
    position: { lat: 37.7749, lng: -122.4194 },
    title: 'San Francisco',
    description: 'The beautiful city by the bay with iconic Golden Gate Bridge'
  },
  {
    id: '2',
    position: { lat: 37.8199, lng: -122.4783 },
    title: 'Golden Gate Bridge',
    description: 'Iconic suspension bridge connecting San Francisco and Marin County'
  },
  {
    id: '3',
    position: { lat: 37.8080, lng: -122.4177 },
    title: 'Alcatraz Island',
    description: 'Historic federal prison island in San Francisco Bay'
  },
  {
    id: '4',
    position: { lat: 37.7694, lng: -122.4862 },
    title: 'Golden Gate Park',
    description: 'Large urban park with gardens, museums, and recreational areas'
  },
  {
    id: '5',
    position: { lat: 37.8024, lng: -122.4058 },
    title: 'Fisherman\'s Wharf',
    description: 'Popular tourist area with shops, restaurants, and sea lions'
  },
  {
    id: '6',
    position: { lat: 40.7589, lng: -73.9851 },
    title: 'Times Square',
    description: 'The bustling heart of New York City'
  },
  {
    id: '7',
    position: { lat: 34.0522, lng: -118.2437 },
    title: 'Los Angeles',
    description: 'City of Angels and entertainment capital of the world'
  },
  {
    id: '8',
    position: { lat: 41.8781, lng: -87.6298 },
    title: 'Chicago',
    description: 'The Windy City known for its architecture and deep-dish pizza'
  }
];

export const mapCenter = { lat: 39.8283, lng: -98.5795 }; // Center of USA

// Sample pins with different types for advanced map features
export const advancedSamplePins = [
  {
    id: '1',
    position: { lat: 37.7749, lng: -122.4194 },
    title: 'San Francisco',
    description: 'The beautiful city by the bay with iconic Golden Gate Bridge',
    type: 'attraction' as const
  },
  {
    id: '2',
    position: { lat: 37.8199, lng: -122.4783 },
    title: 'Golden Gate Bridge',
    description: 'Iconic suspension bridge connecting San Francisco and Marin County',
    type: 'attraction' as const
  },
  {
    id: '3',
    position: { lat: 37.7849, lng: -122.4094 },
    title: 'Chinatown Restaurant',
    description: 'Authentic Chinese cuisine in the heart of San Francisco',
    type: 'restaurant' as const
  },
  {
    id: '4',
    position: { lat: 37.7879, lng: -122.4075 },
    title: 'Union Square Hotel',
    description: 'Luxury accommodation in downtown San Francisco',
    type: 'hotel' as const
  },
  {
    id: '5',
    position: { lat: 37.8024, lng: -122.4058 },
    title: 'Fisherman\'s Wharf',
    description: 'Popular tourist area with shops, restaurants, and sea lions',
    type: 'attraction' as const
  },
  {
    id: '6',
    position: { lat: 37.7699, lng: -122.4781 },
    title: 'Ocean Beach Cafe',
    description: 'Seaside dining with spectacular sunset views',
    type: 'restaurant' as const
  }
];
