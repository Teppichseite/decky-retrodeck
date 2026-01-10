import { ButtonItem, PanelSectionRow } from "@decky/ui";
import { useState } from "react";
import { ButtonItemIconContent } from "./shared";
import { useMenuContext } from "../context";
import { Action } from "../interfaces";

export const ActionsComponent = () => {
    const { displayedActions: actions } = useMenuContext();

    if (actions.length === 0) {
        return <div style={{ textAlign: 'center' }}>There are no actions available.</div>;
    }

    const [openedCategory, setOpenedCategory] = useState<string | null>(null);

    const uncategorizedActions = actions.filter(action => !action.category);

    const categorizedActions = actions
        .filter(action => !uncategorizedActions.some(a => a.name === action.name))
        .reduce((acc, action) => {
            const category = action.category;

            if (!category) {
                return acc;
            }

            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(action);
            return acc;
        }, {} as Record<string, Action[]>);


    return <div>
        {uncategorizedActions.map((action) => (
            <ActionComponent action={action} key={action.id} />
        ))}
        {Object.entries(categorizedActions).map(([category, actionsForCategory]) => (
            <div key={category}>
                <ActionButton
                    onClick={() => {
                        if (category === openedCategory) {
                            setOpenedCategory(null);
                        } else {
                            setOpenedCategory(category);
                        }
                    }}
                    icon={<img src={`https://retrodeck.readthedocs.io/en/latest/wiki_icons/binding_icons/RD-zoom-${openedCategory === category ? 'out' : 'in'}.png`} width={24} height={24} />}
                >
                    {category}
                </ActionButton>
                {openedCategory === category && <div style={{ marginLeft: '15px' }}>
                    {actionsForCategory.map((action) => (
                        <ActionComponent action={action} key={action.id} />
                    ))}
                </div>}
            </div>
        ))}
    </div>;
}

export const ActionComponent = ({ action }: { action: Action }) => {
    const { handleAction, heldActions, gameEvent } = useMenuContext();

    if(!gameEvent) {
        return <div/>;
    }

    const icon = action.icon.type === 'path'
        ? <img alt={action.name} src={action.icon.value} width={24} height={24} />
        : 'v';

    const isHoldAction = action.action.type === 'hotkey' && action.action.operation === 'hold';

    const isHeld = heldActions.includes(action.id);

    const textAddition = `${isHoldAction ? isHeld ? ' - Release' : ' - Hold' : ''}`;

    const isManualViewAction = action.action.type === 'builtin' && action.action.operation === 'view_manual';

    return <ActionButton
        onClick={() => handleAction(action)}
        icon={icon}
        disabled={isManualViewAction && !gameEvent.manual_path}
    >
        {action.name}{textAddition}
    </ActionButton>;
}

interface ActionButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
}

const ActionButton = (props: ActionButtonProps) => {
    return <PanelSectionRow>
        <ButtonItem
            layout="below"
            onClick={props.onClick}
            disabled={props.disabled}
        >
            <ButtonItemIconContent icon={props.icon} >
                {props.children}
            </ButtonItemIconContent>
        </ButtonItem>
    </PanelSectionRow>;
}