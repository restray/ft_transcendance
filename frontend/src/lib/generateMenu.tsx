import { useContext } from 'react';
import { RightClickMenuContext, RightClickMenuValue, Tool } from '../context/rightClickMenu';

export default function useContextMenu( callbacks : Tool[] ) : (e: React.MouseEvent<HTMLDivElement>)=>void
{
    const { activateMenu } = useContext(RightClickMenuContext) as RightClickMenuValue;

    return function( e: React.MouseEvent<HTMLDivElement> ) {
        e.preventDefault();
        e.stopPropagation();
        activateMenu(true, e.clientX, e.clientY, callbacks );
    }
}