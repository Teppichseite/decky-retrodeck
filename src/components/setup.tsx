import { useState } from "react";
import { ButtonItemIconContent } from "./shared";
import { PanelSection, ButtonItem } from "@decky/ui";
import { FaCaretDown, FaCaretRight, FaGamepad } from "react-icons/fa";

export const NoGamePage = () => {
    const [showSettings, setShowSettings] = useState(false);

    return <div>
        <PanelSection>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px',
                marginBottom: '20px'
            }}>
                <FaGamepad size={60}></FaGamepad>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <strong>No game is currently running.</strong>
            </div>
            <ButtonItem layout="below" onClick={() => setShowSettings(!showSettings)}>
                <ButtonItemIconContent icon={showSettings ? <FaCaretDown /> : <FaCaretRight />}>
                    Setup
                </ButtonItemIconContent>
            </ButtonItem>
            {showSettings && <div>
                <Setup />
            </div>}
        </PanelSection>
    </div>;
};

export const Setup = () => {
    return <div style={{ marginTop: '20px' }}>
        The setup currently only supports RetroDeck.
    </div>;
};