import { useEffect, useState } from "react";

type Props = {
  type: "PC" | "Monster";
  onAdd: (char: {
    name: string;
    initiative: number;
    type: "PC" | "Monster";
    HP?: string;
    AC?: string;
    Speed?: string;
    avatarUrl?: string;
    monsterId?: string;
  }) => void;
  onCancel: () => void;
};

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

declare global {
  interface Window {
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<string | ArrayBuffer>;
    }
  }
}

export default function AddCharacterModal({ type, onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [HP, setHP] = useState("");
  const [AC, setAC] = useState("");
  const [Speed, setSpeed] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [monsterId, setMonsterId] = useState("");
  const [monsterList, setMonsterList] = useState<StatblockData[]>([]);
  const [filteredList, setFilteredList] = useState<StatblockData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Attempt to load monster data with proper type
  useEffect(() => {
    if (type === "Monster") {
      setIsLoading(true);
      setLoadError(null);
      
      const loadMonsterData = async () => {
        try {
          let data: string | ArrayBuffer;
          
          // Try to use window.fs if available, otherwise fall back to fetch
          if (window.fs && typeof window.fs.readFile === 'function') {
            try {
              console.log("Attempting to read statblock.json with window.fs");
              data = await window.fs.readFile('/statblock/statblock.json', { encoding: 'utf8' });
            } catch (fsError) {
              console.warn('Failed to read using window.fs, falling back to fetch:', fsError);
              const response = await fetch('/statblock/statblock.json');
              data = await response.text();
            }
          } else {
            // window.fs not available, use fetch API instead
            console.log("Using fetch to get statblock.json");
            const response = await fetch('/statblock/statblock.json');
            data = await response.text();
          }
          
          let parsedData;
          if (typeof data === 'string') {
            console.log("Parsing JSON data from string");
            parsedData = JSON.parse(data) as StatblockData[];
          } else {
            // Handle ArrayBuffer if that's what we get
            console.log("Parsing JSON data from ArrayBuffer");
            const decoder = new TextDecoder('utf-8');
            parsedData = JSON.parse(decoder.decode(data)) as StatblockData[];
          }
          
          console.log("Loaded monster data:", parsedData);
          
          // Validate data structure
          if (!Array.isArray(parsedData)) {
            throw new Error("Monster data is not an array");
          }
          
          // Log all monster names to debug
          console.log("Monster names:", parsedData.map(m => m.name));
          
          setMonsterList(parsedData);
          setFilteredList(parsedData);
        } catch (error) {
          console.error("Error loading monster data:", error);
          setLoadError(error instanceof Error ? error.message : "Unknown error loading monster data");
          setMonsterList([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadMonsterData();
    }
  }, [type]);

  const handleSearchChange = (value: string) => {
    setName(value);
    
    // Filter monster list by search text (search in both id and name)
    const filtered = monsterList.filter((m) =>
      m.id.toLowerCase().includes(value.toLowerCase()) || 
      (m.name && m.name.toLowerCase().includes(value.toLowerCase()))
    );
    
    console.log("Filtered monsters:", filtered.map(m => m.name));
    setFilteredList(filtered);

    // Check if there's an exact match
    const exactMatch = monsterList.find((m) => 
      m.name.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      console.log("Found exact match:", exactMatch);
      setHP(exactMatch.HP);
      setAC(exactMatch.AC);
      setSpeed(exactMatch.Speed);
      setAvatarUrl(exactMatch.avatarUrl || "");
      setMonsterId(exactMatch.id);
      // Use the actual name from the data
      setName(exactMatch.name);
    }

    setShowDropdown(true);
  };

  const handleDropdownSelect = (monster: StatblockData) => {
    console.log("Selected monster:", monster);
    console.log("Selected monster avatar URL:", monster.avatarUrl);
    setName(monster.name);
    setHP(monster.HP);
    setAC(monster.AC);
    setSpeed(monster.Speed);
    setAvatarUrl(monster.avatarUrl || "");
    setMonsterId(monster.id);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    const parsedInit = parseInt(initiative);
    if (!name || isNaN(parsedInit)) return;
    
    onAdd({ 
      name, 
      initiative: parsedInit, 
      type, 
      HP, 
      AC, 
      Speed, 
      avatarUrl,
      monsterId: monsterId || undefined
    });
  };

  // Component for displaying monster avatar with fallbacks
  const MonsterAvatar = ({ src, name }: { src?: string, name: string }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      const checkImage = async () => {
        setIsLoading(true);
        
        if (!src) {
          setImgSrc(null);
          setIsLoading(false);
          return;
        }
        
        console.log("Checking image:", src);
        
        // Try loading the image
        const img = new Image();
        img.onload = () => {
          console.log("Image loaded successfully:", src);
          setImgSrc(src);
          setIsLoading(false);
        };
        img.onerror = () => {
          console.error("Failed to load image:", src);
          setImgSrc(null);
          setIsLoading(false);
        };
        img.src = src;
      };
      
      checkImage();
    }, [src]);
    
    if (isLoading) {
      return (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (!imgSrc) {
      return (
        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
          {name.charAt(0).toUpperCase()}
        </div>
      );
    }
    
    return (
      <img
        src={imgSrc}
        alt={name}
        className="w-6 h-6 rounded-full object-cover"
        onError={() => setImgSrc(null)}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black-600 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded p-4 w-full max-w-sm sm:max-w-md shadow text-black relative">
        <h2 className="text-lg sm:text-xl font-bold mb-2">Add {type}</h2>

        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2">Loading monsters...</p>
          </div>
        )}

        {loadError && (
          <div className="text-red-500 p-2 mb-4 text-sm border border-red-200 bg-red-50 rounded">
            {loadError}
          </div>
        )}

        {type === "Monster" && !isLoading && monsterList.length === 0 && (
          <div className="text-amber-700 p-2 mb-4 text-sm border border-amber-200 bg-amber-50 rounded">
            No monster data available. Check the console for errors.
          </div>
        )}

        {type === "Monster" ? (
          <>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search monster"
                value={name}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full border px-2 py-1 rounded bg-white text-black text-sm sm:text-base"
              />
              {showDropdown && filteredList.length > 0 && (
                <ul 
                  className="absolute left-0 right-0 bg-white border border-gray-300 rounded max-h-40 sm:max-h-60 overflow-y-auto z-50"
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing dropdown before click
                >
                  {filteredList.map((monster, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleDropdownSelect(monster)}
                      className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm sm:text-base truncate flex items-center gap-2"
                    >
                      <MonsterAvatar src={monster.avatarUrl} name={monster.name} />
                      <span>{monster.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {monsterId && (
              <div className="p-2 mb-4 text-xs text-gray-500 border border-gray-200 bg-gray-50 rounded">
                ID: {monsterId}<br/>
                Avatar: {avatarUrl || "None"}
              </div>
            )}

            <input
              type="text"
              placeholder="HP"
              value={HP}
              onChange={(e) => setHP(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="AC"
              value={AC}
              onChange={(e) => setAC(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="Speed"
              value={Speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black text-sm sm:text-base"
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black text-sm sm:text-base"
            />
          </>
        )}

        <input
          type="number"
          placeholder="Initiative"
          value={initiative}
          onChange={(e) => setInitiative(e.target.value)}
          className="w-full border px-2 py-1 mb-4 rounded bg-white text-black text-sm sm:text-base"
        />

        <div className="flex justify-end gap-2">
          <button 
            onClick={onCancel} 
            className="px-3 py-1 rounded bg-gray-300 text-sm sm:text-base cursor-pointer hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-3 py-1 rounded bg-blue-500 text-white text-sm sm:text-base cursor-pointer hover:bg-blue-600 transition-colors"
            disabled={!name || !initiative}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}