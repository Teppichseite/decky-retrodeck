import {
  staticClasses
} from "@decky/ui";
import {
  definePlugin
  // routerHook
} from "@decky/api"
import { FaGamepad } from "react-icons/fa";
import { NoGamePage } from "./components/setup";
import { Game } from "./components/game";
import { MenuContextProvider, useMenuContext } from "./context";

function Menu() {

  const { gameEvent } = useMenuContext();

  if (!gameEvent) {
    return <NoGamePage />;
  }

  return <Game />;
};

function Content() {
  return <MenuContextProvider>
    <Menu />
  </MenuContextProvider>;
}


export default definePlugin(() => {
  console.log("Template plugin initializing, this is called once on frontend startup");

  return {
    name: "RetroDeck Menu",
    titleView: <div className={staticClasses.Title}>RetroDeck Menu</div>,
    content: <Content />,
    icon: <FaGamepad />,
    onDismount() {
      console.log("Unloading");
    }
  };
});
