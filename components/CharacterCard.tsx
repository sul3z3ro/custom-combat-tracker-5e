import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ConditionBadge from "./ConditionBadge";
import ConditionModal from "./ConditionModal";
import ConditionPopup from "./ConditionPopup";
import ConditionInfoOverlay from "./ConditionInfoOverlay";
import StatblockPopup from "./StatblockPopup"; // <<-- import ตัวใหม่

type StatblockData = {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  source?: string;
  AC?: string;
  HP?: string;
  Speed?: string;
  abilities?: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  abilityModifiers?: {
    STR: string;
    DEX: string;
    CON: string;
    INT: string;
    WIS: string;
    CHA: string;
  };
  skills?: { [key: string]: string };
  resistances?: string;
  immunities?: string;
  vulnerabilities?: string;
  senses?: string;
  languages?: string;
  CR?: string;
  traits?: { name: string; description: string }[];
  actions?: { name: string; description: string }[];
  bonusActions?: { name: string; description: string }[];
  reactions?: { name: string; description: string }[];
  legendaryActions?: { name: string; description: string }[];
  lairActions?: { name: string; description: string }[];
  regionalEffects?: { name: string; description: string }[];
  avatarUrl?: string;
};


type Condition = {
  id: string;
  name: string;
  color: string;
  textColor: string;
  dcStat: string;
  dcValue?: number;
  maxRounds?: number;
  remainingRounds?: number;
  isStartOfTurn: boolean;
  isEndOfTurn: boolean;
  addedAtRound: number;
  lastReducedAtRound?: number;
};

type Character = {
  name: string;
  initiative: number;
  type: "PC" | "Monster";
  HP?: string;
  AC?: string;
  Speed?: string;
  displayName?: string;
  avatarUrl?: string;
  monsterId?: string; // เพิ่มสำหรับเชื่อม Statblock
};

type Props = {
  char: Character;
  isActive: boolean;
  onEndTurn?: () => void;
  currentRound?: number;
  triggerStartCheck?: boolean;
  triggerEndCheck?: boolean;
  onDeleteCharacter?: () => void;
  onEndConditionResolved?: () => void;
  onStartConditionResolved?: () => void;
};

export default function CharacterCard({
  char,
  isActive,
  onEndTurn,
  currentRound = 1,
  triggerStartCheck = false,
  triggerEndCheck = false,
  onDeleteCharacter,
  onEndConditionResolved,
  onStartConditionResolved,
}: Props) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [popupQueue, setPopupQueue] = useState<Condition[]>([]);
  const [pendingTriggerType, setPendingTriggerType] = useState<"start" | "end" | null>(null);
  const [infoOverlay, setInfoOverlay] = useState<string | null>(null);
  const prevStartTriggerRef = useRef(false);
  const prevEndTriggerRef = useRef(false);
  const [selectedStatblock, setSelectedStatblock] = useState<StatblockData | null>(null);

  // <<-- state สำหรับ Statblock Popup
  const [showStatblock, setShowStatblock] = useState(false);
  const handleShowStatblock = async () => {
  if (char.type === "Monster") {
    const response = await fetch("/statblock/statblock.json");
    const statblockList: StatblockData[] = await response.json();
    const found = statblockList.find(
      m => m.id === char.monsterId || m.name === char.name
    );
    if (found) {
      setSelectedStatblock(found);
      setShowStatblock(true);
      }
    }
  };
  // Handle Start of Turn conditions
  useEffect(() => {
    if (triggerStartCheck && !prevStartTriggerRef.current) {
      const startConds = conditions.filter((c) => c.isStartOfTurn);
      if (startConds.length > 0) {
        setPopupQueue(startConds);
        setPendingTriggerType("start");
      } else {
        onStartConditionResolved?.();
      }
    }
    prevStartTriggerRef.current = triggerStartCheck;
  }, [triggerStartCheck, conditions]);

  // Handle End of Turn conditions
  useEffect(() => {
    if (triggerEndCheck && !prevEndTriggerRef.current) {
      const endConds = conditions.filter((c) => c.isEndOfTurn);
      if (endConds.length > 0) {
        setPopupQueue(endConds);
        setPendingTriggerType("end");
      } else {
        reduceRounds();
        onEndConditionResolved?.();
      }
    }
    prevEndTriggerRef.current = triggerEndCheck;
  }, [triggerEndCheck, conditions]);

  const reduceRounds = () => {
    setConditions((prev) =>
      prev
        .map((c) => {
          if (
            c.remainingRounds !== undefined &&
            c.lastReducedAtRound !== currentRound
          ) {
            return {
              ...c,
              remainingRounds: c.remainingRounds - 1,
              lastReducedAtRound: currentRound,
            };
          }
          return c;
        })
        .filter((c) => c.remainingRounds === undefined || c.remainingRounds > 0)
    );
  };

  const handleAddCondition = (condition: Condition) => {
    setConditions((prev) => [...prev, condition]);
    setShowAddModal(false);
  };

  const handleResult = (success: boolean) => {
    const current = popupQueue[0];
    if (!current) return;

    if (success) {
      setConditions((prev) => prev.filter((c) => c.id !== current.id));
    } // fail: ไม่ลดรอบที่นี่
    const remaining = [...popupQueue.slice(1)];
    setPopupQueue(remaining);

    if (remaining.length === 0) {
      if (pendingTriggerType === "end") {
        reduceRounds();
        onEndConditionResolved?.();
      } else if (pendingTriggerType === "start") {
        onStartConditionResolved?.();
      }
      setPendingTriggerType(null);
    }
  };

  const handleDeleteCondition = (conditionName: string) => {
    setConditions((prev) => prev.filter((c) => c.name !== conditionName));
    setInfoOverlay(null);
  };

  // --- Render ส่วนของการ์ด ---
  return (
    <>
      <motion.div
        layout
        layoutId={char.displayName}
        key={char.displayName}
        transition={{ layout: { duration: 0.6, ease: "easeInOut" } }}
        animate={{ opacity: isActive ? 1 : 0.7 }}
        className={`bg-white text-black rounded shadow p-2 md:p-3 relative z-10 min-h-[80px] ${isActive ? 'border-2 border-blue-500' : ''}`}
      >
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-1">
              {/* อวตาร */}
              <div className="flex-shrink-0">
                {char.avatarUrl ? (
                  <img
                    src={char.avatarUrl}
                    alt={`${char.name} avatar`}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    ?
                  </div>
                )}
              </div>
              {/* ชื่อ: คลิกแล้วโชว์ Statblock (เฉพาะ Monster) */}
              <div className="flex-1 min-w-0">
                {char.type === "Monster" ? (
                  <span
                    className="font-bold text-base md:text-lg text-black hover:underline cursor-pointer"
                    title="ดู Statblock"
                    onClick={handleShowStatblock}
                  >
                    {char.displayName ?? `(${char.initiative}) ${char.name}`}
                  </span>
                ) : (
                  <span className="font-bold text-base md:text-lg">{char.displayName ?? char.name}</span>
                )}
                {/* HP, AC, Speed — แยกบรรทัด */}
                {char.HP && <div className="text-xs text-gray-600">HP: {char.HP}</div>}
                {char.AC && <div className="text-xs text-gray-600">AC: {char.AC}</div>}
                {char.Speed && <div className="text-xs text-gray-600">Speed: {char.Speed}</div>}
              </div>

              {/* เพิ่มปุ่มกะโหลกลบ/จบเทิร์น/ฯลฯ ตรงนี้ได้ */}
            </div>
            {/* Conditions badge */}
            <div className="flex flex-wrap items-center">
              {conditions.map((c) => (
                <ConditionBadge
                  key={c.id}
                  condition={c}
                  onClickInfo={(name) => setInfoOverlay(name)}
                />
              ))}
              <button
                className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 cursor-pointer"
                onClick={() => setShowAddModal(true)}
              >
                + Condition
              </button>
            </div>
          </div>
        </div>
        {/* ปุ่มจบเทิร์น, ปุ่มลบตัวละคร, ... */}
        <div className="flex justify-end gap-2 mt-2">
          {onEndTurn && isActive && (
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
              onClick={onEndTurn}
            >
              End Turn
            </button>
          )}
          {onDeleteCharacter && (
            <button
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-700 cursor-pointer"
              onClick={onDeleteCharacter}
              title="ลบตัวละครนี้"
            >
              💀
            </button>
          )}
        </div>
      </motion.div>
      {/* Modal: เพิ่มสถานะ */}
      {showAddModal && (
        <ConditionModal
          onAdd={handleAddCondition}
          onCancel={() => setShowAddModal(false)}
          currentRound={currentRound}
        />
      )}
      {/* Modal: ข้อมูลสถานะ */}
      {infoOverlay && (
        <ConditionInfoOverlay
          title={infoOverlay}
          description={
            // หา description ตาม conditionInfo (ต้องมีไฟล์ conditionInfo.json/ts)
            require("./ConditionInfo").default[infoOverlay]?.description || ""
          }
          onClose={() => setInfoOverlay(null)}
          onDelete={() => handleDeleteCondition(infoOverlay)}
        />
      )}
      {/* Modal: popup saving throw */}
      {popupQueue.length > 0 && (
        <ConditionPopup
          conditionName={popupQueue[0].name}
          dcStat={popupQueue[0].dcStat}
          dcValue={popupQueue[0].dcValue}
          onResult={handleResult}
        />
      )}
      {/* Modal: StatblockPopup */}
      {showStatblock && char.type === "Monster" && selectedStatblock && (
        <StatblockPopup
          statblock={selectedStatblock}
          onClose={() => {
            setShowStatblock(false);
            setSelectedStatblock(null);
          }}
        />
      )}
    </>
  );
}
