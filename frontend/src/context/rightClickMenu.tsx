import React, {createContext, useReducer, useCallback} from 'react';
import { rightClickMenuReducer } from '../reducer/rightClickMenuReducer';
export const RightClickMenuContext = createContext<RightClickMenuValue | null>(null);

export interface Tool {
	func: ()=>void,
	name: string
}

export interface RightClickMenuState {

	activate: boolean;
	x: number;
	y: number;
	tools: Tool[] | undefined;
}

export interface RightClickMenuValue {

	activateMenu: (activate: boolean,x: number,y: number,tools: Tool[] | undefined) => void,
	content: RightClickMenuState
}

// enum RightClickMenuKind {
//     ACTIVATE_MENU = 'ACTIVATE_MENU',
//     DELETE_MENU = 'DELETE_MENU',
// }

export interface RightClickMenuAction {

    type: string,
    payload: RightClickMenuState
}

export const RightClickMenuProvider = ( {children}: { children: JSX.Element} ) => {
    const initialeState = {
        tools: [],
        activate: false,
        x: 0,
        y: 0
    }
    const [menuValue,dispatch] = useReducer(rightClickMenuReducer, initialeState);

    const activateMenu = useCallback(
    (activate: boolean,x: number,y: number,tools: Tool[] | undefined) => {
        dispatch({
            type: "ACTIVATE_MENU",
            payload: {
                activate,
                x,
                y,
                tools
            }
        });
    }, 
    [dispatch])

    const value: RightClickMenuValue = {
        activateMenu,
        content: menuValue,
    }
    return (
        <RightClickMenuContext.Provider value={value}>
            {children}
        </RightClickMenuContext.Provider>
    )
}