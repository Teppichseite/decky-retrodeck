import { useState } from "react";
import { ButtonItemIconContent } from "./shared";
import { PanelSection, ButtonItem } from "@decky/ui";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import retrodeckLogo from "../../assets/retrodeck-logo.png";

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
                <img src={retrodeckLogo} width={80} height={80} />
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