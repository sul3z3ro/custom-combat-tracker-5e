import { useState } from "react";

const conditionPresets = [
  { name: "Blinded", color: "#000000", textColor: "#FFFFFF" },
  { name: "Charmed", color: "#FF00FF", textColor: "#FFFFFF" },
  { name: "Deafened", color: "#CC6600", textColor: "#FFFFFF" },
  { name: "Exhaustion", color: "#FFFF00", textColor: "#000000" },
  { name: "Frightened", color: "#5B6C26", textColor: "#FFFFFF" },
  { name: "Grappled", color: "#000033", textColor: "#FFFFFF" },
  { name: "Incapacitated", color: "#3c96a3", textColor: "#FFFFFF" },
  { name: "Invisible", color: "#FFFFFF", textColor: "#000000" },
  { name: "Paralyzed", color: "#d18d82", textColor: "#FFFFFF" },
  { name: "Petrified", color: "#663300", textColor: "#FFFFFF" },
  { name: "Poisoned", color: "#006600", textColor: "#FFFFFF" },
  { name: "Prone", color: "#003319", textColor: "#FFFFFF" },
  { name: "Restrained", color: "#FF0000", textColor: "#FFFFFF" },
  { name: "Stunned", color: "#000066", textColor: "#FFFFFF" },
  { name: "Unconscious", color: "#330000", textColor: "#FFFFFF" },
  { name: "Other", color: "", textColor: "#000000" }
];

const colorPresets = [
  "#FF0000", "#FF8000", "#FFFF00", "#80FF00", "#00FF00", "#00FF80", "#00FFFF", "#0080FF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F", "#808080",
  "#FF3333", "#FF9933", "#FFFF33", "#99FF33", "#33FF33", "#33FF99", "#33FFFF", "#3399FF", "#3333FF", "#9933FF", "#FF33FF", "#FF3399", "#A0A0A0",
  "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FF66", "#66FFB2", "#66FFFF", "#66B2FF", "#6666FF", "#B266FF", "#FF66FF", "#FF66B2", "#C0C0C0",
  "#FF9999", "#FFCC99", "#FFFF99", "#CCFF99", "#99FF99", "#99FFCC", "#99FFFF", "#99CCFF", "#9999FF", "#CC99FF", "#FF99FF", "#FF99CC", "#E0E0E0",
  "#FFCCCC", "#FFE5CC", "#FFFFCC", "#E5FFCC", "#CCFFCC", "#CCFFE5", "#CCFFFF", "#CCE5FF", "#CCCCFF", "#E5CCFF", "#FFCCFF", "#FFCCE5", "#FFFFFF",
];

const dcStats = ["None", "STR", "DEX", "CON", "INT", "WIS", "CHA"];

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
};

type Props = {
  onAdd: (condition: Condition) => void;
  onCancel: () => void;
  currentRound: number;
};

export default function ConditionModal({ onAdd, onCancel, currentRound }: Props) {
  const [name, setName] = useState("Blinded");
  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [dcStat, setDcStat] = useState("None");
  const [dcValue, setDcValue] = useState("");
  const [rounds, setRounds] = useState("");
  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    const preset = conditionPresets.find(c => c.name === value);
    if (preset) {
      setCustomColor(preset.color);
      setTextColor(preset.textColor);
    }
  };

  const handleAdd = () => {
    const color = name === "Other" ? customColor : (conditionPresets.find(c => c.name === name)?.color || "#FF0000");
    const condition: Condition = {
      id: Date.now().toString(),
      name: name === "Other" ? customName || "Custom" : name,
      color,
      textColor,
      dcStat,
      dcValue: dcStat !== "None" && dcValue ? parseInt(dcValue) : undefined,
      maxRounds: rounds ? parseInt(rounds) : undefined,
      remainingRounds: rounds ? parseInt(rounds) : undefined,
      isStartOfTurn: start,
      isEndOfTurn: end,
      addedAtRound: currentRound
    };
    onAdd(condition);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-grey bg-opacity-60 z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-4 rounded w-full max-w-sm sm:max-w-md text-black max-h-[90vh] overflow-y-auto">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Add Condition</h2>

          <select 
            value={name} 
            onChange={(e) => handleNameChange(e.target.value)} 
            className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
          >
            {conditionPresets.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>

          {name === "Other" && (
            <>
              <input
                type="text"
                placeholder="Condition Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
              />

              <div className="text-xs sm:text-sm mt-1 sm:mt-2">Select Color:</div>
              <div className="grid grid-cols-7 sm:grid-cols-13 gap-1">
                {colorPresets.map(color => (
                  <div
                    key={color}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded cursor-pointer border-2 ${customColor === color ? "border-black" : "border-white"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomColor(color)}
                  />
                ))}
              </div>
            </>
          )}

          <select 
            value={dcStat} 
            onChange={(e) => setDcStat(e.target.value)} 
            className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
          >
            {dcStats.map(stat => (
              <option key={stat} value={stat}>{stat}</option>
            ))}
          </select>

          {dcStat !== "None" && (
            <input
              type="number"
              value={dcValue}
              onChange={(e) => setDcValue(e.target.value)}
              placeholder="DC Value"
              className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
            />
          )}

          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
            placeholder="Duartion (round)"
            className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
          />

          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm sm:text-base">
            <label className="flex items-center">
              <input type="checkbox" checked={start} onChange={() => setStart(!start)} className="mr-1" /> 
              <span>Start of Turn</span>
            </label>
            <label className="flex items-center mt-1 sm:mt-0">
              <input type="checkbox" checked={end} onChange={() => setEnd(!end)} className="mr-1" /> 
              <span>End of Turn</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button 
              onClick={onCancel} 
              className="bg-red-500 text-black px-2 py-1 text-xs md:text-sm rounded cursor-pointer hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={name === "Other" && !customColor}
              className="bg-blue-500 text-white px-2 py-1 text-xs md:text-sm rounded cursor-pointer hover:bg-blue-600 transition-colors"
            >
              Add Condition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}