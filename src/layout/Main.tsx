import { Outlet } from "react-router-dom";
import Aside from "./aside/Aside";

const Main = () => {
  return (
    <div className="flex h-screen">
      <div className="fixed z-50">
        <Aside />
      </div>
      <div className="flex-1  h-[calc(100vh-221px)] w-full lg:w-[calc(100%-80px)] relative lg:h-full bg-stone-25 ">
        <main className=" h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Main;

