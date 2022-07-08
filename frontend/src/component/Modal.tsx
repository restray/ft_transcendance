import React, { ReactElement, useEffect, useState } from 'react'
import ReactDOM from 'react-dom';

export function useModal(children: ReactElement<any, any>) {

	const [open, setOpen] = useState(false);
	const modal = <Modal open={open} setOpen={setOpen}>{children}</Modal>
	
	return {
		isOpen: open,
		modal: modal,
		setOpen: setOpen
	}
}

export default function Modal({ children, open, setOpen }:
{ children: ReactElement<any, any>, open: boolean, setOpen: (arg0: boolean)=>void }) {

	function onScroll(e: React.WheelEvent<HTMLDivElement>) {
		
		console.log('hey')
		e.stopPropagation()
	}

	// useEffect(()=>{
	// 	if (open)
	// 		document.body.style.overflow = 'hidden';
	// 	else
	// 		document.body.style.overflow = 'unset';
	// }, [open])

	return (
		ReactDOM.createPortal((
			open 
			? <div className='Modal' style={{
				width: '100vw',
				height: '100vh',
				position: 'fixed',
				bottom: 0,
				left: 0,
				zIndex: 1000,
				overflow: 'scroll'
			}}
			onScroll={onScroll}
			>
				<div className="Modal__bg" style={{
					width: '100vw',
					height: '100vh',
					position: 'absolute',
					backgroundColor: 'grey',
					opacity: '70%',
				}}
				onClick={()=>{setOpen(false)}}
				></div>
				<div className="Modal__content" style={{
					position: 'absolute',
					zIndex: 2,
				}}>{children}</div>
			</div>
			: <></>
		), document.getElementById('root')! )
	)
}
