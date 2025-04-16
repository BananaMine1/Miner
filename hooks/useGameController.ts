import { useState } from 'react';

// Types for action statuses
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export function useGameController() {
  // Status state for each action
  const [claimStatus, setClaimStatus] = useState<TxStatus>('idle');
  const [repairStatus, setRepairStatus] = useState<TxStatus>('idle');
  const [upgradeStatus, setUpgradeStatus] = useState<TxStatus>('idle');
  const [buyStatus, setBuyStatus] = useState<TxStatus>('idle');

  // Simulate async contract call
  const simulateTx = async (setStatus: (s: TxStatus) => void) => {
    setStatus('pending');
    await new Promise((res) => setTimeout(res, 1200));
    setStatus('success');
    return { txHash: '0xtesthash', status: 'success' };
  };

  // Claim BNANA rewards
  const claim = async () => {
    return simulateTx(setClaimStatus);
  };

  // Repair a miner by ID
  const repairMiner = async (minerId: number) => {
    return simulateTx(setRepairStatus);
  };

  // Upgrade room to a new level
  const upgradeRoom = async (nextLevel: number) => {
    return simulateTx(setUpgradeStatus);
  };

  // Buy a miner by ID
  const buyMiner = async (minerId: number) => {
    return simulateTx(setBuyStatus);
  };

  return {
    claim,
    repairMiner,
    upgradeRoom,
    buyMiner,
    statuses: {
      claim: claimStatus,
      repair: repairStatus,
      upgrade: upgradeStatus,
      buy: buyStatus,
    },
  };
} 