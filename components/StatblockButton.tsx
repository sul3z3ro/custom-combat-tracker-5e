import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatblockPopup from "./StatblockPopup";

// เพิ่ม type declaration สำหรับ window.fs
declare global {
  interface Window {
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<string | ArrayBuffer>;
    }
  }
}

interface StatblockData {
  id: string;
  name: string;
  source: string;
  page?: number;
  size: string;
  type: string;
  alignment: string;
  AC: string;
  HP: string;
  Speed: string;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  abilityModifiers: {
    STR: string;
    DEX: string;
    CON: string;
    INT: string;
    WIS: string;
    CHA: string;
  };
  savingThrows?: {
    [key: string]: string;
  };
  skills?: {
    [key: string]: string;
  };
  resistances?: string;
  immunities?: string;
  vulnerabilities?: string;
  senses?: string;
  languages?: string;
  CR: string;
  traits?: Array<{ name: string; description: string }>;
  actions?: Array<{ name: string; description: string }>;
  bonusActions?: Array<{ name: string; description: string }>;
  reactions?: Array<{ name: string; description: string }>;
  legendaryActions?: Array<{ name: string; description: string }>;
  lairActions?: Array<{ name: string; description: string }>;
  regionalEffects?: Array<{ name: string; description: string }>;
  environment?: string;
  avatarUrl?: string;
}

export default function StatblockButton({ monsterId }: { monsterId: string }) {
  const [showStatblock, setShowStatblock] = useState(false);
  const [monsterData, setMonsterData] = useState<StatblockData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMonsterData = async () => {
    setLoading(true);
    try {
      let data: string | ArrayBuffer;
      
      // Try to use window.fs if available, otherwise fall back to fetch
      if (window.fs && typeof window.fs.readFile === 'function') {
        try {
          data = await window.fs.readFile('/statblock.json', { encoding: 'utf8' });
        } catch (fsError) {
          console.warn('Failed to read using window.fs, falling back to fetch:', fsError);
          const response = await fetch('/statblock.json');
          data = await response.text();
        }
      } else {
        // window.fs not available, use fetch API instead
        const response = await fetch('/statblock.json');
        data = await response.text();
      }
      
      let parsedData;
      if (typeof data === 'string') {
        parsedData = JSON.parse(data);
      } else {
        // Handle ArrayBuffer if that's what we get
        const decoder = new TextDecoder('utf-8');
        parsedData = JSON.parse(decoder.decode(data));
      }
      
      // Find the monster by ID
      const monster = parsedData.find((m: StatblockData) => m.id === monsterId);
      
      if (monster) {
        setMonsterData(monster);
        setShowStatblock(true);
      } else {
        console.error('Monster not found:', monsterId);
      }
    } catch (error) {
      console.error('Error fetching monster data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="text-blue-700 hover:text-blue-900 cursor-pointer hover:underline font-medium flex items-center gap-1"
        onClick={() => fetchMonsterData()}
        title="View monster statblock"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Stats</span>
      </button>

      {/* Render the StatblockPopup into a portal to avoid z-index issues */}
      {showStatblock && monsterData && (
        <StatblockPopup 
          monster={monsterData} 
          onClose={() => setShowStatblock(false)} 
        />
      )}

      {loading && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 999998 }} // Very high z-index, but below the statblock
        >
          <div className="bg-white p-4 rounded shadow">
            <p>Loading monster data...</p>
          </div>
        </div>
      )}
    </>
  );
}