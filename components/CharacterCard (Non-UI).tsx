import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ConditionBadge from "./ConditionBadge";
import ConditionModal from "./ConditionModal";
import ConditionPopup from "./ConditionPopup";
import ConditionInfoOverlay from "./ConditionInfoOverlay";
import conditionInfo from "./ConditionInfo";

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
  onStartConditionResolved
}: Props) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [popupQueue, setPopupQueue] = useState<Condition[]>([]);
  const [pendingTriggerType, setPendingTriggerType] = useState<"start" | "end" | null>(null);
  const [infoOverlay, setInfoOverlay] = useState<string | null>(null);
  const prevStartTriggerRef = useRef(false);
  const prevEndTriggerRef = useRef(false);

  // Handle Start of Turn conditions
  useEffect(() => {
    if (triggerStartCheck && !prevStartTriggerRef.current) {
      const startConds = conditions.filter((c) => c.isStartOfTurn);
      if (startConds.length > 0) {
        setPopupQueue(startConds);
        setPendingTriggerType("start");
      } else {
        // No start conditions, notify parent we're done
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
        // No end conditions, reduce rounds and notify parent we're done
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
              lastReducedAtRound: currentRound
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
    } else if (pendingTriggerType === "end") {
      // Don't reduce rounds here, we'll do it when all conditions are processed
    }

    const remaining = [...popupQueue.slice(1)];
    setPopupQueue(remaining);

    if (remaining.length === 0) {
      if (pendingTriggerType === "end") {
        reduceRounds();
        onEndConditionResolved?.(); // Notify that end conditions are resolved
      } else if (pendingTriggerType === "start") {
        onStartConditionResolved?.(); // Notify that start conditions are resolved
      }
      setPendingTriggerType(null);
    }
  };

  const handleDeleteCondition = (conditionName: string) => {
    setConditions((prev) => prev.filter((c) => c.name !== conditionName));
    setInfoOverlay(null);
  };

  return (
    <>
      <motion.div
        layout
        layoutId={char.displayName}
        key={char.displayName}
        transition={{ layout: { duration: 0.6, ease: "easeInOut" } }}
        animate={{ opacity: isActive ? 1 : 0.7 }}
        className="bg-white text-black rounded shadow p-2 relative z-10 min-h-[80px]"
      >
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-bold">{char.displayName ?? `(${char.initiative})${char.name}`}</div>
              <button
                className="bg-gray-300 text-black px-2 py-1 text-xs rounded"
                onClick={() => setShowAddModal(true)}
              >
                + สถานะ
              </button>
            </div>
            {char.type === "Monster" && (
              <div className="text-sm pl-6">
                {char.HP && <div>HP: {char.HP}</div>}
                {char.AC && <div>AC: {char.AC}</div>}
                {char.Speed && <div>Speed: {char.Speed}</div>}
              </div>
            )}
            <div className="flex flex-wrap mt-2">
              {conditions.map((cond) => (
                <ConditionBadge
                  key={cond.id}
                  condition={cond}
                  onClickInfo={(name) => setInfoOverlay(name)}
                />
              ))}
            </div>
          </div>
        </div>

        {isActive && onEndTurn && (
          <button
            className="bg-blue-500 text-white px-2 py-1 text-sm rounded absolute top-2 right-2"
            onClick={onEndTurn}
          >
            จบเทิร์น
          </button>
        )}

        <div className="absolute bottom-2 right-2">
          <button
            className="text-red-600 text-xl"
            onClick={() => {
              if (window.confirm(`${char.displayName} ถูกกำจัดแล้วใช่หรือไม่?`)) {
                onDeleteCharacter?.();
              }
            }}
          >
            💀
          </button>
        </div>
      </motion.div>

      {showAddModal && (
        <ConditionModal
          onAdd={handleAddCondition}
          onCancel={() => setShowAddModal(false)}
          currentRound={currentRound}
        />
      )}

      {popupQueue.length > 0 && (
        <ConditionPopup
          conditionName={popupQueue[0].name}
          dcStat={popupQueue[0].dcStat}
          dcValue={popupQueue[0].dcValue}
          onResult={handleResult}
        />
      )}

      {infoOverlay && (
        <ConditionInfoOverlay
          title={infoOverlay}
          description={conditionInfo[infoOverlay] || "ไม่มีข้อมูล"}
          onClose={() => setInfoOverlay(null)}
          onDelete={() => handleDeleteCondition(infoOverlay)}
        />
      )}
    </>
  );
}