import React, {useContext} from 'react'
import ReactDOM from 'react-dom';
import { RightClickMenuContext, Tool, RightClickMenuValue } from '../context/rightClickMenu';

export default function RightClickMenu() {
    const { activateMenu, content } = useContext(RightClickMenuContext) as RightClickMenuValue;

    function deleteMenu( e: React.MouseEvent<HTMLDivElement> ) {
        e.preventDefault();
        activateMenu(false ,0 ,0, undefined)
    }
    
    const style = {
        top: content.y,
        left: content.x
    }
    return ReactDOM.createPortal(
    <>
        {content.activate && 
        <div className="rightClickMenu--container" onContextMenu={(e) => deleteMenu(e)} onClick={(e) => deleteMenu(e)}>
            <div className="rightClickMenu" style={style}>
                <ul>
                    {content.tools?.map( (tool: Tool, i: number) => {
                        return <li onClick={tool.func} key={i}>{tool.name}</li>
                    })}
                </ul>
            </div>
        </div>}
    </>
    , document.getElementById('root')! )
}