import React from "react";
import ReactDOM from "react-dom";

type Props = {
  title: string;
  description: string;
  onClose: () => void;
  onDelete?: () => void;
};

export default function ConditionInfoOverlay({ title, description, onClose, onDelete }: Props) {
  const renderMarkdown = (text: string) => {
    let html = text.replace(/\$\*\*(.*?)\*\*\$/g, "<strong>$1</strong>");
    html = html.replace(/\$\[(.*?)\]\$/g, "<em>$1</em>");
    html = html.replace(/\n/g, "<br/>");
    return html;
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-black rounded shadow-lg w-full max-w-xs sm:max-w-md p-4 sm:p-6 relative flex flex-col">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{title}</h2>
        <div
          className="text-xs sm:text-sm space-y-1 sm:space-y-2 mb-3 sm:mb-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
        />
        <hr className="border-t border-gray-300 mb-3 sm:mb-4" />
        <div className="flex justify-between">
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 rounded bg-red-500 text-white text-sm sm:text-base cursor-pointer hover:bg-red-600 transition-colors"
            >
              ลบสถานะ
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-blue-500 text-white text-sm sm:text-base cursor-pointer hover:bg-blue-600 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}