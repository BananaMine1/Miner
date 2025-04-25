// Define the RoomConfig interface
export interface RoomConfig {
  id: string;
  name: string;
  backgroundUrl: string;
  gridTileUrl: string;
  gridCols: number;
  gridRows: number;
  isNight: boolean;
  wattOutput: number;
  miners: {
    id: string;
    textureUrl: string;
    gridX: number;
    gridY: number;
  }[];
}

// Mock data for rooms
const rooms: RoomConfig[] = [
  {
    id: '1',
    name: 'Room 1',
    backgroundUrl: '/images/room1-day.png',
    gridTileUrl: '/images/grid-tile.png',
    gridCols: 10,
    gridRows: 10,
    isNight: false,
    wattOutput: 100,
    miners: [
      { id: 'miner1', textureUrl: '/images/miner1.png', gridX: 2, gridY: 3 },
      { id: 'miner2', textureUrl: '/images/miner2.png', gridX: 5, gridY: 6 },
    ],
  },
  // Add more room configurations as needed
];

// Function to get all rooms
export function getAllRooms(): RoomConfig[] {
  return rooms;
}

// Function to get a room by ID
export function getRoomById(id: string): RoomConfig | undefined {
  return rooms.find(room => room.id === id);
} 