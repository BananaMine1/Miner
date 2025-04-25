// lib/gameData.ts

export const roomLevels = [
    {
      name: "Starter Shack",
      level: 0,
      background: "/assets/rooms/shack.jpg",
      gridCols: 2,
      gridRows: 2,
      maxSlots: 4,
      maxPower: 40,
      upgradeCost: 0,
      gridCorners: {
        topLeft: { x: 530, y: 690 },
        topRight: { x: 755, y: 606 },
        bottomLeft: { x: 750, y: 790 },
        bottomRight: { x: 975, y: 690},
        
      },
      description: 'A humble shack to start your mining journey.'
    },
    {
      name: "Swamp Shed",
      level: 1,
      background: "/assets/rooms/swamp_shed.jpg",
      gridCols: 5,
      gridRows: 2,
      maxSlots: 10,
      maxPower: 300,
      upgradeCost: 300,
      gridCorners: {
        topLeft: { x: 180, y: 180 },
        topRight: { x: 600, y: 180 },
        bottomLeft: { x: 180, y: 420 },
        bottomRight: { x: 600, y: 420 },
      },
      description: 'A shed in the swamp, more space for miners.'
    },
    {
      name: "Jungle Garage",
      level: 2,
      background: "/assets/rooms/jungle_garage.jpg",
      gridCols: 6,
      gridRows: 2,
      maxSlots: 12,
      maxPower: 420,
      upgradeCost: 450,
      gridCorners: {
        topLeft: { x: 160, y: 160 },
        topRight: { x: 700, y: 160 },
        bottomLeft: { x: 160, y: 440 },
        bottomRight: { x: 700, y: 440 },
      },
      description: 'A garage in the jungle, for serious mining.'
    }
  ];
  
  export const miners = [
    {
      id: 1,
      name: "Banana Blaster",
      watts: 30,
      hash: 1000
    },
    {
      id: 2,
      name: "Vine Sucker",
      watts: 20,
      hash: 800
    },
    {
      id: 3,
      name: "Jungle Jiggler",
      watts: 25,
      hash: 900
    }
  ];
  