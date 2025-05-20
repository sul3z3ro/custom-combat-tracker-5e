import { useEffect, useState } from "react";

// type สำหรับ statblock แต่ละตัว (อ้างอิงตาม json template ใหม่)
type Statblock = {
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
  abilities: { [k: string]: number };
  abilityModifiers: { [k: string]: string };
  savingThrows?: { [k: string]: string };
  skills?: { [k: string]: string };
  resistances?: string;
  immunities?: string;
  vulnerabilities?: string;
  senses?: string;
  languages?: string;
  CR: string;
  traits?: { name: string; description: string }[];
  actions?: { name: string; description: string }[];
  bonusActions?: { name: string; description: string }[];
  reactions?: { name: string; description: string }[];
  legendaryActions?: { name: string; description: string }[];
  lairActions?: { name: string; description: string }[];
  regionalEffects?: { name: string; description: string }[];
  environment?: string;
  avatarUrl?: string;
};

type Props = {
  monsterId: string;
  onClose: () => void;
};

export default function StatblockPopup({ monsterId, onClose }: Props) {
  const [statblock, setStatblock] = useState<Statblock | null>(null);
  const [loading, setLoading] = useState(true);

  // โหลด json ทุกครั้งที่ popup เปิด (ตามที่ user ต้องการ)
  useEffect(() => {
    setLoading(true);
    fetch("/statblock/statblock.json") // ปรับ path ให้ตรงตามที่ใช้งานจริง
      .then(res => res.json())
      .then((data: Statblock[]) => {
        // ค้นหา statblock ที่ id ตรงกับที่ต้องการ (case-insensitive)
        const found = data.find(
          sb =>
            sb.id.toLowerCase() === monsterId.toLowerCase() ||
            sb.name?.toLowerCase() === monsterId.toLowerCase()
        );
        setStatblock(found || null);
        setLoading(false);
      })
      .catch(() => {
        setStatblock(null);
        setLoading(false);
      });
  }, [monsterId]);

  // ปิด popup เมื่อกด backdrop หรือกด ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // markdown function (basic bold, italic, newline)
  function renderMarkdown(text: string) {
    if (!text) return "";
    // **bold**
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // *italic*
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // [label](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="underline">$1</a>');
    // newlines
    html = html.replace(/\n/g, "<br/>");
    return html;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-grey bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white rounded shadow-lg p-6 text-black text-lg font-bold">
          Loading...
        </div>
      </div>
    );
  }

  if (!statblock) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-grey bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white rounded shadow-lg p-6 text-black">
          <div className="text-lg font-bold mb-2">Not Found</div>
          <button
            onClick={onClose}
            className="mt-2 px-4 py-2 rounded bg-blue-500 text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ซ่อน section ที่ไม่มีข้อมูล (ถ้าเป็น array ต้องเช็ค .length > 0)
  const {
    name,
    source,
    page,
    size,
    type,
    alignment,
    AC,
    HP,
    Speed,
    abilities,
    abilityModifiers,
    savingThrows,
    skills,
    resistances,
    immunities,
    vulnerabilities,
    senses,
    languages,
    CR,
    traits,
    actions,
    bonusActions,
    reactions,
    legendaryActions,
    lairActions,
    regionalEffects,
    avatarUrl,
  } = statblock;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-grey bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white text-black rounded shadow-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto relative p-4 md:p-8"
        onClick={e => e.stopPropagation()} // ไม่ให้ backdrop ปิด popup เมื่อคลิกในเนื้อหา
      >
        {/* Header Section */}
        <div className="flex flex-row items-center gap-4 mb-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded object-cover border-2 border-gray-300"
            />
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{name}</h2>
            <div className="text-sm text-gray-600">{size} {type}, {alignment}</div>
            <div className="text-xs text-gray-500">
              {source}
              {page ? ` p.${page}` : ""}
            </div>
          </div>
        </div>

        {/* Stat Section */}
        <div className="flex flex-wrap gap-4 mb-3">
          <div>
            <span className="font-bold">AC: </span>{AC}
          </div>
          <div>
            <span className="font-bold">HP: </span>{HP}
          </div>
          <div>
            <span className="font-bold">Speed: </span>{Speed}
          </div>
        </div>

        {/* Abilities Table */}
        <div className="mb-4">
          <div className="font-bold mb-1">Ability Scores</div>
          <div className="grid grid-cols-6 text-center border rounded">
            {["STR", "DEX", "CON", "INT", "WIS", "CHA"].map(stat => (
              <div key={stat} className="p-2 border-r last:border-r-0">
                <div className="font-bold">{stat}</div>
                <div>
                  {abilities[stat]}{" "}
                  <span className="text-gray-500">{abilityModifiers[stat]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saving Throws, Skills, Senses, Languages */}
        <div className="mb-3">
          {savingThrows && Object.keys(savingThrows).length > 0 && (
            <div><span className="font-bold">Saving Throws: </span>
              {Object.entries(savingThrows).map(([k, v]) => `${k} ${v}`).join(", ")}
            </div>
          )}
          {skills && Object.keys(skills).length > 0 && (
            <div><span className="font-bold">Skills: </span>
              {Object.entries(skills).map(([k, v]) => `${k} ${v}`).join(", ")}
            </div>
          )}
          {resistances && resistances.trim() && (
            <div><span className="font-bold">Damage Resistances: </span>{resistances}</div>
          )}
          {immunities && immunities.trim() && (
            <div><span className="font-bold">Damage Immunities: </span>{immunities}</div>
          )}
          {vulnerabilities && vulnerabilities.trim() && (
            <div><span className="font-bold">Damage Vulnerabilities: </span>{vulnerabilities}</div>
          )}
          {senses && (
            <div><span className="font-bold">Senses: </span>{senses}</div>
          )}
          {languages && (
            <div><span className="font-bold">Languages: </span>{languages}</div>
          )}
          {CR && (
            <div><span className="font-bold">CR: </span>{CR}</div>
          )}
        </div>

        {/* Traits */}
        {traits && traits.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Traits</div>
            {traits.map((trait, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{trait.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(trait.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Actions</div>
            {actions.map((action, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{action.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(action.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bonus Actions */}
        {bonusActions && bonusActions.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Bonus Actions</div>
            {bonusActions.map((b, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{b.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(b.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Reactions</div>
            {reactions.map((r, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{r.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(r.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Legendary Actions */}
        {legendaryActions && legendaryActions.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Legendary Actions</div>
            {legendaryActions.map((l, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{l.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(l.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Lair Actions */}
        {lairActions && lairActions.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Lair Actions</div>
            {lairActions.map((l, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{l.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(l.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Regional Effects */}
        {regionalEffects && regionalEffects.length > 0 && (
          <div className="mb-4">
            <div className="font-bold mb-1">Regional Effects</div>
            {regionalEffects.map((r, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">{r.name}</div>
                <div
                  className="pl-2"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(r.description),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ปุ่มปิด */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded text-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
