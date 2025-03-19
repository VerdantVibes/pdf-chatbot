import { House, FolderClosed, History, NotebookPen } from "lucide-react";
import { IoGift } from "react-icons/io5";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { IoHelpCircleSharp } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";

function Aside() {

  const menuItems = [
    { Icon: House, label: "Home" },
    { Icon: FolderClosed, label: "References" },
    { Icon: NotebookPen, label: "Writer" },
    { Icon: History, label: "History" },
  ];

  const bottomItems = [
    { Icon: IoGift, label: "Refer & Earn" },
    { Icon: IoChatbubbleEllipsesSharp, label: "Support" },
    { Icon: IoHelpCircleSharp, label: "Help" },
  ];
  return (
    <div className="w-20 bg-secondary border  h-screen flex flex-col items-center gap-4">
      <section className="flex flex-col items-center">
        <div className="h-14">logo</div>
      </section>
      <section className="flex flex-col h-full justify-between py-3">
        <div className="flex flex-col h-full items-center gap-6">
          {menuItems.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center" aria-label={label}>
              <Icon className="size-6 text-primary" />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col h-full  justify-end items-center gap-6">
          {bottomItems.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center" aria-label={label}>
              <Icon className="size-6 text-primary" />
              <span className="text-xs">{label}</span>
            </div>
          ))}
          <div className="size-8 bg-gray-500 flex items-center justify-center rounded-full" aria-label="Logout">
            <TbLogout2 className="size-6 text-white" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Aside;
