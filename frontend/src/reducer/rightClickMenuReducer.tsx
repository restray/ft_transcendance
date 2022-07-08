import { RightClickMenuAction, RightClickMenuState } from "../context/rightClickMenu";

export const rightClickMenuReducer = (state: RightClickMenuState , action: RightClickMenuAction ) => {
    if(action.type === 'ACTIVATE_MENU') {
        state.activate = action.payload.activate;
        state.x = action.payload.x;
        state.y = action.payload.y;
        state.tools = action.payload.tools;
        return {...state}
    } 
    return state
}