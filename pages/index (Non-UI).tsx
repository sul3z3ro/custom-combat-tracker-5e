import { useEffect, useState, useRef } from "react";
import AddCharacterModal from "../components/AddCharacterModal";
import CharacterCard from "../components/CharacterCard";

type Character = {
  name: string;
  initiative: number;
  type: "PC" | "Monster";
  HP?: string;
  AC?: string;
  Speed?: string;
  displayName?: string;
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

  useEffect(() => {
    if (combatStarted && turnIndex === 0) {
      if (!roundAdvancedRef.current) {
        setRound((prev) => prev + 1);
        roundAdvancedRef.current = true;
      }
    } else if (turnIndex !== 0) {
      roundAdvancedRef.current = false;
    }
  }, [turnIndex]);

  const resetCombat = () => {
    setCharacters([]);
    setCombatStarted(false);
    setRound(1);
    setTurnIndex(0);
  };

  const sortCharacters = (chars: Character[]) => {
    return [...chars].sort((a, b) => {
      if (a.initiative !== b.initiative) return b.initiative - a.initiative;
      if (a.type === "PC" && b.type === "Monster") return -1;
      if (a.type === "Monster" && b.type === "PC") return 1;
      return 0;
    });
  };

  const insertCharacterSmart = (char: Character) => {
    const current = characters[turnIndex];
    let displayName = `(${char.initiative})${char.name}`;
    if (char.type === "Monster") {
      const sameMonsters = characters.filter(
        (c) => c.type === "Monster" && c.name === char.name
      );
      displayName = `(${char.initiative})${char.name}#${sameMonsters.length + 1}`;
    }

    const newChar = { ...char, displayName };
    const newList = [...characters];

    if (!combatStarted) {
      newList.push(newChar);
    } else {
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
    }

    setCharacters(newList);
  };

  const startCombat = () => {
    const sorted = sortCharacters(characters);
    setCharacters(sorted);
    setCombatStarted(true);
    setTurnIndex(0);
    setRound(1);
  };

  // Modified nextTurn to handle conditions sequentially
  const nextTurn = () => {
    // Set processing flag to prevent multiple triggers
    setProcessingConditions(true);
    
    // Trigger end of turn condition checks
    setEndTurnTrigger(true);
  };

  // Handle the end of condition resolution
  const handleEndConditionResolved = () => {
    setEndTurnTrigger(false);
    
    // Actually change turns
    if (turnIndex + 1 >= characters.length) {
      const sorted = sortCharacters(characters);
      setCharacters(sorted);
      setTurnIndex(0);
    } else {
      setTurnIndex((prev) => prev + 1);
    }
    
    // Schedule start of turn trigger for next frame to ensure UI updates first
    setTimeout(() => {
      setStartTurnTrigger(true);
      setProcessingConditions(false);
    }, 50);
  };

  // Handle the start of condition resolution completed
  const handleStartConditionResolved = () => {
    setStartTurnTrigger(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">CCT5e - Initiative Tracker</h1>
        {!combatStarted ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={startCombat}
          >
            เริ่ม Combat
          </button>
        ) : (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={resetCombat}
          >
            จบ Combat
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setAddingType("PC");
            setIsModalOpen(true);
          }}
        >
          + Add PC
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setAddingType("Monster");
            setIsModalOpen(true);
          }}
        >
          + Add Monster
        </button>
      </div>

      {combatStarted && (
        <div className="text-center text-xl font-semibold mb-2">
          รอบที่ {round}
        </div>
      )}

      <div className="relative flex flex-col gap-2">
        {characters.map((char, index) => (
          <CharacterCard
            key={char.displayName}
            char={char}
            onDeleteCharacter={() => {
              setCharacters((prev) => {
                const updated = prev.filter((c) => c !== char);
                // ถ้าลบตัวที่เล่นอยู่ตอนนี้
                if (combatStarted && prev[turnIndex] === char) {
                  if (updated.length === 0) return [];
                  if (turnIndex >= updated.length) {
                    setTurnIndex(0);
                  }
                }
                return updated;
              });
            }}
            isActive={combatStarted && index === turnIndex}
            onEndTurn={combatStarted && !processingConditions ? nextTurn : undefined}
            currentRound={round}
            triggerStartCheck={combatStarted && index === turnIndex && startTurnTrigger}
            triggerEndCheck={combatStarted && index === turnIndex && endTurnTrigger}
            onEndConditionResolved={handleEndConditionResolved}
            onStartConditionResolved={handleStartConditionResolved}
          />
        ))}
      </div>

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