import { useState } from "react";
import { AtSign, Crop, MoveRight, RotateCw, Share2, X } from "lucide-react";

const ChatView = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative h-full flex flex-col">
      {/* Top Controls */}
      <div className="sticky top-0 left-0 w-full h-12 flex justify-end items-center gap-4 bg-white z-10 border-b px-4">
        <button>
          <Share2 width={16} />
        </button>
        <button>
          <RotateCw width={16} />
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 w-full h-auto overflow-y-scroll custom-scroll"></div>

      {/* Chat Input Box */}
      <div className="px-4 pb-4">
        <div className="sticky bottom-3 left-0 w-full bg-white">
          <div className="relative border border-stone-300 rounded-xl px-5 py-3 flex flex-col">
            <input
              type="text"
              className="w-full outline-none border-0 bg-transparent text-stone-700 text-sm"
              placeholder="Ask your question here... (use @ to mention a paper)"
              onFocus={() => setIsDropdownOpen(true)}
            />

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full bg-white shadow-lg border border-stone-300 rounded-lg p-3 z-20">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-semibold text-sm">
                    You've hit the limit! Please log in to access more
                    generations
                  </span>
                  <button onClick={() => setIsDropdownOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                <ul className="mt-2 space-y-2 text-sm text-stone-700">
                  <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                    <AtSign size={16} /> Explain the summary
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                    <AtSign size={16} /> What research methodology was used?
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                    <AtSign size={16} /> What are the limitations of this study?
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                    <AtSign size={16} /> What were the key findings of the
                    paper?
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                    <AtSign size={16} /> Explain the abstract of the paper?
                  </li>
                </ul>
              </div>
            )}

            {/* Input Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <AtSign width={16} />
                <Crop width={16} />
              </div>
              <button className="p-2 rounded-md bg-gray-900 text-white">
                <MoveRight width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
