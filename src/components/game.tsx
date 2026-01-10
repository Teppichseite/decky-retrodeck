import { PanelSection, staticClasses } from "@decky/ui";
import { ActionsComponent } from "./actions";
import { useMenuContext } from "../context";

export function Game() {

    const { gameEvent } = useMenuContext();

    if (!gameEvent) {
        return <div/>;
    }

    return <div>
        <PanelSection>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
            }}>
                {gameEvent.image_path && <img
                    src={gameEvent.image_path.replace(/\\/g, "")}
                    alt={gameEvent.name}
                    style={{ width: "60%", marginTop: '10px' }}
                />}
                <div className={staticClasses.PanelSectionTitle} style={{ marginTop: '20px' }}>
                    {gameEvent.name} - {gameEvent.system_name.toUpperCase()}
                </div>
                <div style={{ marginTop: '5px', marginBottom: '20px' }}>
                    {gameEvent.emulator_name.join(' - ')}
                </div>
            </div>
            <ActionsComponent />
        </PanelSection>
    </div>;
};