import { useState, useRef, useEffect } from "react";
import CharacterCard from "../components/CharacterCard";
import AddCharacterModal from "../components/AddCharacterModal";

// type Character ควรตรงกับที่ใช้ใน CharacterCard
type Character = {
  name: string;
  initiative: number;
  type: "PC" | "Monster";
  HP?: string;
  AC?: string;
  Speed?: string;
  displayName?: string;
  avatarUrl?: string;
  monsterId?: string;
};

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingType, setAddingType] = useState<"PC" | "Monster">("PC");
  const [combatStarted, setCombatStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);
  const [startTurnTrigger, setStartTurnTrigger] = useState(false);
  const [endTurnTrigger, setEndTurnTrigger] = useState(false);
  const [processingConditions, setProcessingConditions] = useState(false);
  const roundAdvancedRef = useRef(false);

  // ==== ฟังก์ชันหาหมายเลขที่ว่างสำหรับ monster (รองรับ space หลัง #) ====
  function getNextMonsterNumber(name: string, charList: Character[]) {
    const usedNumbers = new Set<number>();
    charList.forEach(c => {
      if (c.type === "Monster" && c.name === name && c.displayName) {
        // รองรับ #, #1, # 1, #   1
        const match = c.displayName.match(/#\s*(\d+)$/);
        if (match) usedNumbers.add(Number(match[1]));
      }
    });
    let n = 1;
    while (usedNumbers.has(n)) n++;
    return n;
  }

  // == Combat Logic ==
  useEffect(() => {
    if (combatStarted && turnIndex === 0) {
      if (!roundAdvancedRef.current) {
        setRound((prev) => prev + 1);
        roundAdvancedRef.current = true;
      }
    } else if (turnIndex !== 0) {
      roundAdvancedRef.current = false;
    }
  }, [turnIndex, combatStarted]);

  const resetCombat = () => {
    setCharacters([]);
    setCombatStarted(false);
    setRound(1);
    setTurnIndex(0);
  };

  // เรียงลำดับ initiative (PC > Monster หากเท่ากัน)
  const sortCharacters = (chars: Character[]) => {
    return [...chars].sort((a, b) => {
      if (a.initiative !== b.initiative) return b.initiative - a.initiative;
      if (a.type === "PC" && b.type === "Monster") return -1;
      if (a.type === "Monster" && b.type === "PC") return 1;
      return 0;
    });
  };

  // ใส่ตัวละครระหว่าง combat ตามกฎเฉพาะ (smart insert)
  const insertCharacterSmart = (char: Character) => {
    // --- สร้าง displayName ตามเดิม ---
    let displayName = `(${char.initiative}) ${char.name}`;
    let monsterId = char.monsterId || char.name;

    if (char.type === "Monster") {
      const monsterNumber = getNextMonsterNumber(char.name, characters);
      displayName = `(${char.initiative}) ${char.name} #${monsterNumber}`;
      monsterId = char.monsterId || char.name;
    }

    const newChar = { ...char, displayName, monsterId };
    const newList = [...characters];
    const current = characters[turnIndex];

    if (!current) {
      newList.push(newChar);
      setCharacters(newList);
      return;
    }

    if (char.initiative > current.initiative) {
      let insertIndex = turnIndex + 1;
      while (
        insertIndex < newList.length &&
        newList[insertIndex].initiative >= char.initiative
      ) {
        insertIndex++;
      }
      newList.splice(insertIndex, 0, newChar);
    } else {
      let inserted = false;
      for (let i = turnIndex + 1; i < newList.length; i++) {
        if (newList[i].initiative < char.initiative) {
          newList.splice(i, 0, newChar);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        newList.push(newChar);
      }
    }
    setCharacters(newList);
  };

  // เริ่ม combat (sort ใหม่)
  const startCombat = () => {
    const sorted = sortCharacters(characters);
    setCharacters(sorted);
    setCombatStarted(true);
    setTurnIndex(0);
    setRound(1);
  };

  const nextTurn = () => {
    setProcessingConditions(true);
    setEndTurnTrigger(true);
  };

  const handleEndConditionResolved = () => {
    setEndTurnTrigger(false);

    if (turnIndex + 1 >= characters.length) {
      const sorted = sortCharacters(characters);
      setCharacters(sorted);
      setTurnIndex(0);
    } else {
      setTurnIndex((prev) => prev + 1);
    }

    setTimeout(() => {
      setStartTurnTrigger(true);
      setProcessingConditions(false);
    }, 50);
  };

  const handleStartConditionResolved = () => {
    setStartTurnTrigger(false);
  };

  // ลบตัวละคร (เมื่อกดปุ่ม delete)
  const handleDeleteCharacter = (index: number) => {
    const newChars = [...characters];
    newChars.splice(index, 1);
    setCharacters(newChars);
    if (turnIndex >= newChars.length) {
      setTurnIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 md:p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-xl md:text-3xl font-bold">
          CCT5e - Initiative & Condition Tracker
        </h1>
        {!combatStarted ? (
          <button
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors duration-200"
            onClick={startCombat}
          >
            Start Combat
          </button>
        ) : (
          <button
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transition-colors duration-200"
            onClick={resetCombat}
          >
            End Combat
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm md:text-base cursor-pointer transition-colors"
          onClick={() => {
            setIsModalOpen(true);
            setAddingType("PC");
          }}
        >
          + Add PC
        </button>
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm md:text-base cursor-pointer transition-colors"
          onClick={() => {
            setIsModalOpen(true);
            setAddingType("Monster");
          }}
        >
          + Add Monster
        </button>
      </div>

      {/* แสดงรอบและ turn */}
      {combatStarted && (
        <div className="text-lg md:text-2xl text-center font-bold mb-4">
          รอบที่ {round}
        </div>
      )}

      {/* ลิสต์ตัวละคร */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map((char, idx) => (
          <CharacterCard
            key={char.displayName || char.name + idx}
            char={char}
            isActive={combatStarted && idx === turnIndex}
            onEndTurn={combatStarted && idx === turnIndex ? nextTurn : undefined}
            currentRound={round}
            triggerStartCheck={combatStarted && idx === turnIndex && startTurnTrigger}
            triggerEndCheck={combatStarted && idx === turnIndex && endTurnTrigger}
            onDeleteCharacter={() => handleDeleteCharacter(idx)}
            onEndConditionResolved={handleEndConditionResolved}
            onStartConditionResolved={handleStartConditionResolved}
          />
        ))}
      </div>

      {/* Modal: เพิ่มตัวละคร */}
      {isModalOpen && (
        <AddCharacterModal
          type={addingType}
          onAdd={(char) => {
            insertCharacterSmart(char);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
