// lib/gameData.ts

export const roomLevels = [
    {
      name: "Starter Farm",
      level: 0,
      background: "/assets/rooms/shack.jpg",
      gridCols: 2,
      gridRows: 2,
      maxSlots: 4,
      maxPower: 150,
      upgradeCost: 0,
      gridCorners: {
        topLeft: { x: 530, y: 690 },
        topRight: { x: 755, y: 606 },
        bottomLeft: { x: 750, y: 790 },
        bottomRight: { x: 975, y: 690},
        
      },
      description: 'A humble farm to start your burrow journey.'
    },
    {
      name: "Level 1 Farm",
      level: 1,
      background: "/assets/rooms/swamp_shed.jpg",
      gridCols: 2,
      gridRows: 4,
      maxSlots: 10,
      maxPower: 300,
      upgradeCost: 300,
      gridCorners: {
        topLeft: { x: 180, y: 180 },
        topRight: { x: 600, y: 180 },
        bottomLeft: { x: 180, y: 420 },
        bottomRight: { x: 600, y: 420 },
      },
      description: 'An upgraded farm with more space for bunnies'
    },
    {
      name: "Level 2 Farm",
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
      description: 'An upgraded farm with more space for bunnies'
    }
  ];
  
  export const miners = [
    {
      id: 1,
      name: "Bunny Digger",
      price: 10,
      hash: 200,
      watts: 8,
      level: 1,
      maxLevel: 5,
      xpToNext: 100,
      baseUpgradeCost: 1,
      baseRepairRate: 0.1,
      durability: 100,
      image: "/assets/bunnies/bunny-digging.png"
    },
    {
      id: 2,
      name: "Bunny Planter",
      price: 30,
      hash: 600,
      watts: 18,
      level: 1,
      maxLevel: 6,
      xpToNext: 120,
      baseUpgradeCost: 3,
      baseRepairRate: 0.2,
      durability: 100,
      image: "/assets/bunnies/bunny-planting.png"
    },
    {
      id: 3,
      name: "Bunny Harvester",
      price: 100,
      hash: 2000,
      watts: 50,
      level: 1,
      maxLevel: 7,
      xpToNext: 150,
      baseUpgradeCost: 10,
      baseRepairRate: 0.5,
      durability: 100,
      image: "/assets/bunnies/bunny-harvesting.png"
    },
    {
      id: 4,
      name: "Tropic Titan",
      price: 350,
      hash: 7500,
      watts: 180,
      level: 1,
      maxLevel: 8,
      xpToNext: 200,
      baseUpgradeCost: 35,
      baseRepairRate: 1.0,
      durability: 100,
      image: "/assets/miner/miner-4.png"
    },
    {
      id: 5,
      name: "Bunny Ace",
      price: 1200,
      hash: 25000,
      watts: 400,
      level: 1,
      maxLevel: 9,
      xpToNext: 300,
      baseUpgradeCost: 120,
      baseRepairRate: 2.0,
      durability: 100,
      image: "/assets/miner/miner-5.png"
    },
    {
      id: 6,
      name: "Gold Packer",
      price: 3000,
      hash: 80000,
      watts: 900,
      level: 1,
      maxLevel: 10,
      xpToNext: 400,
      baseUpgradeCost: 300,
      baseRepairRate: 4.0,
      durability: 100,
      image: "/assets/miner/miner-6.png"
    },
    {
      id: 7,
      name: "Mystic Planter",
      price: 5000,
      hash: 200000,
      watts: 1800,
      level: 1,
      maxLevel: 12,
      xpToNext: 500,
      baseUpgradeCost: 500,
      baseRepairRate: 8.0,
      durability: 100,
      image: "/assets/miner/miner-7.png"
    },
    {
      id: 8,
      name: "Solar Planter",
      price: 8000,
      hash: 400000,
      watts: 2800,
      level: 1,
      maxLevel: 13,
      xpToNext: 600,
      baseUpgradeCost: 800,
      baseRepairRate: 12.0,
      durability: 100,
      image: "/assets/miner/miner-8.png"
    },
    {
      id: 9,
      name: "Cosmic Packer",
      price: 10000,
      hash: 800000,
      watts: 4000,
      level: 1,
      maxLevel: 15,
      xpToNext: 800,
      baseUpgradeCost: 1000,
      baseRepairRate: 20.0,
      durability: 100,
      image: "/assets/miner/miner-9.png"
    }
  ];
  