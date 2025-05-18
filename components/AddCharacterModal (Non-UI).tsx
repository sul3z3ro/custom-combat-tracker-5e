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
  }) => void;
  onCancel: () => void;
};

type Statblock = {
  id: string;
  HP: string;
  AC: string;
  Speed: string;
};

export default function AddCharacterModal({ type, onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [HP, setHP] = useState("");
  const [AC, setAC] = useState("");
  const [Speed, setSpeed] = useState("");
  const [monsterList, setMonsterList] = useState<Statblock[]>([]);
  const [filteredList, setFilteredList] = useState<Statblock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (type === "Monster") {
      fetch("/statblock/statblock.json")
        .then((res) => res.json())
        .then((data: Statblock[]) => {
          setMonsterList(data);
          setFilteredList(data);
        })
        .catch(() => setMonsterList([]));
    }
  }, [type]);

  const handleSearchChange = (value: string) => {
    setName(value);
    const filtered = monsterList.filter((m) =>
      m.id.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredList(filtered);

    const matched = monsterList.find((m) => m.id.toLowerCase() === value.toLowerCase());
    if (matched) {
      setHP(matched.HP);
      setAC(matched.AC);
      setSpeed(matched.Speed);
    } else {
      setHP("");
      setAC("");
      setSpeed("");
    }

    setShowDropdown(true);
  };

  const handleDropdownSelect = (value: string) => {
    const matched = monsterList.find((m) => m.id === value);
    if (matched) {
      setName(matched.id);
      setHP(matched.HP);
      setAC(matched.AC);
      setSpeed(matched.Speed);
    } else {
      setName(value);
      setHP("");
      setAC("");
      setSpeed("");
    }
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    const parsedInit = parseInt(initiative);
    if (!name || isNaN(parsedInit)) return;
    onAdd({ name, initiative: parsedInit, type, HP, AC, Speed });
  };

  return (
    <div className="fixed inset-0 bg-black-600 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded p-4 w-80 shadow text-black relative">
        <h2 className="text-xl font-bold mb-2">Add {type}</h2>

        {type === "Monster" ? (
          <>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search monster"
                value={name}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full border px-2 py-1 rounded bg-white text-black"
              />
              {showDropdown && filteredList.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded max-h-40 overflow-y-auto z-50">
                  {filteredList.map((mon, i) => (
                    <li
                      key={i}
                      onClick={() => handleDropdownSelect(mon.id)}
                      className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                    >
                      {mon.id}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="text"
              placeholder="HP"
              value={HP}
              onChange={(e) => setHP(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black"
            />
            <input
              type="text"
              placeholder="AC"
              value={AC}
              onChange={(e) => setAC(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black"
            />
            <input
              type="text"
              placeholder="Speed"
              value={Speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full border px-2 py-1 mb-2 rounded bg-white text-black"
            />
          </>
        ) : (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-2 py-1 mb-2 rounded bg-white text-black"
          />
        )}

        <input
          type="number"
          placeholder="Initiative"
          value={initiative}
          onChange={(e) => setInitiative(e.target.value)}
          className="w-full border px-2 py-1 mb-4 rounded bg-white text-black"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-3 py-1 rounded bg-blue-500 text-white">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
