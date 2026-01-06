import {
  Navigation,
  Router,
  staticClasses
} from "@decky/ui";
import {
  definePlugin,
  routerHook,
} from "@decky/api"
import { FaGamepad } from "react-icons/fa";
import { NoGamePage } from "./components/setup";
import { Game } from "./components/game";
import { MenuContextProvider, useMenuContext } from "./context";
import { PdfViewer } from "./components/pdf-viewer";

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
  console.log("Template plugin initializing, this is called once on frontend startup1");

  routerHook.addRoute("/retrodeck-menu/pdf-viewer", () => {
    return <MenuContextProvider>
      <PdfViewer />
    </MenuContextProvider>;
  });

  return {
    name: "RetroDeck Menu",
    titleView: <div className={staticClasses.Title}>RetroDeck Menu</div>,
    content: <Content />,
    icon: <FaGamepad />,
    onDismount() {
      console.log("Unloading");
      routerHook.removeRoute("/retrodeck-menu/pdf-viewer")
    }
  };
});
