import React, { useEffect } from "react";

type StatblockData = {
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

interface Props {
  statblock: StatblockData | null;
  onClose: () => void;
}

const abilityOrder = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export default function StatblockPopup({ statblock, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!statblock) return null;

  // -- destructure --
  const {
    name, size, type, alignment, source,
    AC, HP, Speed, abilities, abilityModifiers,
    skills, resistances, immunities, vulnerabilities,
    senses, languages, CR, avatarUrl,
    traits, actions, bonusActions, reactions, legendaryActions, lairActions, regionalEffects
  } = statblock;

  // Markdown minimal
  function renderDescription(desc?: string) {
    if (!desc) return null;
    let html = desc.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    html = html.replace(/\*(.*?)\*/g, "<i>$1</i>");
    html = html.replace(/\n/g, "<br/>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  function renderSection(label: string, entries?: { name: string; description: string }[]) {
    if (!entries || entries.length === 0) return null;
    return (
      <div className="mt-3">
        <div style={{ fontFamily: "'Scala Sans Offc'"}} className="font-bold text-xl border-b-2 border-red-900 text-red-900 mb-1">{label}</div>
        <ul className="space-y-0">
          {entries.map((e, idx) =>
            <li key={idx} className="pl-2">
              <span style={{ fontFamily: "'Scala Sans Offc'"}} className="font-semibold italic text-[15px]">{e.name}.</span>{" "}
              <span style={{ fontFamily: "'Scala Sans Offc'", fontSize: "15px" }} >{renderDescription(e.description)}</span>
            </li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-2 bg-[#fff1d4] rounded-xl border-4 border-red-900 shadow-2xl font-serif overflow-y-auto max-h-[90vh] p-5 text-[#000000]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-red-900 text-xl font-bold px-2 py-1 rounded hover:bg-red-100 cursor-pointer"
          aria-label="Close"
        >×</button>

        {/* Header: ชื่อ + รูป */}
        <div className="flex items-center mb-2">
          {avatarUrl && (
            <img src={avatarUrl} alt={name} className="w-20 h-20 object-cover rounded-lg mr-4 border-2 border-red-900" />
          )}
          <div>
            <div style={{ fontFamily: "'Mrs Eaves Roman Small Caps'"}} className="text-2xl font-semibold text-red-900 leading-tight">{name}</div>
            <div style={{ fontFamily: "'Scala Sans Offc'"}} className="text-base italic text-gray-800">
              {size} {type}{alignment ? `, ${alignment}` : ""}
            </div>
          </div>
        </div>

        <div className="border-b border-red-900 my-3"></div>

        {/* AC, HP, Speed */}
        <div style={{ fontFamily: "'Scala Sans Offc'"}} className="space-y-0 mb-2 text-[15px]">
          {AC && <div><span className="text-red-900 font-semibold">AC:</span> {AC}</div>}
          {HP && <div><span className="text-red-900 font-semibold">HP:</span> {HP}</div>}
          {Speed && <div><span className="text-red-900 font-semibold">Speed:</span> {Speed}</div>}
        </div>
          <div className="border-b-2 border-red-900 my-2"></div>
        {/* Abilities */}
        {abilities &&
          <div className="grid grid-cols-6 gap-2 mb-1 text-center text-[15px]">
            {abilityOrder.map(stat =>
              <div key={stat}>
                <div style={{ fontFamily: "'Scala Sans Offc'"}} className="font-bold text-normal text-red-900">{stat}</div>
                <div style={{ fontFamily: "'Scala Sans Offc'"}} className="font-extrabold text-normal text-black-900">
                  {abilities[stat as keyof typeof abilities]}
                  <span style={{ fontFamily: "'Scala Sans Offc'"}} className="text-lg text-Black-700 font-bold ml-1">
                    ({abilityModifiers?.[stat as keyof typeof abilityModifiers]})
                  </span>
                </div>
              </div>
            )}
          </div>
        }
        <div className="border-b-2 border-red-900 my-2"></div>
        {/* Skills, Resistances, Immunities, Vulnerabilities, Senses, Languages, CR */}
        <div style={{ fontFamily: "'Scala Sans Offc'"}} className="space-y-0 mb-2">
          {skills && Object.keys(skills).length > 0 &&
            <div>
              <span className="font-bold text-red-900">Skills:</span>{" "}
              {Object.entries(skills).map(([k, v]) => `${k} ${v}`).join(", ")}
            </div>
          }
          {resistances && resistances.length > 0 && <div><span className="font-bold text-red-900">Resistances:</span> {resistances}</div>}
          {immunities && immunities.length > 0 && <div><span className="font-bold text-red-900">Immunities:</span> {immunities}</div>}
          {vulnerabilities && vulnerabilities.length > 0 && <div><span className="font-bold text-red-900">Vulnerabilities:</span> {vulnerabilities}</div>}
          {senses && senses.length > 0 && <div><span className="font-bold text-red-900">Senses:</span> {senses}</div>}
          {languages && languages.length > 0 && <div><span className="font-bold text-red-900">Languages:</span> {languages}</div>}
          {CR && CR.length > 0 && <div><span className="font-bold text-red-900">CR:</span> {CR}</div>}
        </div>

        <div className="border-b border-red-900 my-2"></div>

        {/* Traits */}
        {traits && traits.length > 0 && renderSection("Traits", traits)}

        {/* Actions */}
        {actions && actions.length > 0 && renderSection("Actions", actions)}

        {/* Bonus Actions */}
        {bonusActions && bonusActions.length > 0 && renderSection("Bonus Actions", bonusActions)}

        {/* Reactions */}
        {reactions && reactions.length > 0 && renderSection("Reactions", reactions)}

        {/* Legendary Actions */}
        {legendaryActions && legendaryActions.length > 0 && renderSection("Legendary Actions", legendaryActions)}

        {/* Lair Actions */}
        {lairActions && lairActions.length > 0 && renderSection("Lair Actions", lairActions)}

        {/* Regional Effects */}
        {regionalEffects && regionalEffects.length > 0 && renderSection("Regional Effects", regionalEffects)}

      </div>
    </div>
  );
}
