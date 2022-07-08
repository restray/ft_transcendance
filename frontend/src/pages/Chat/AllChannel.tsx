import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChannelContextMenu, getWindowDimensions, RoomData } from './Chat'
import arrow from '../../images/arrow.svg'
import ret from '../../images/return.svg'
import home from '../../images/home.svg'
import { sanitizeQuery } from '../../lib/queryString'
import { Channel } from 'diagnostics_channel'
import { HEADERS } from '../..'
import { UserContext, UserContextValue } from '../../context/userContext'

function ChatBubble({ roomData, location }
: {roomData: RoomData, location: string}) {

	var [searchParams, setSearchParams] = useSearchParams()

	// useEffect(()=>{
	// 	fetch(`http://localhost:3000/channels/${roomId}?start=0&end=0`, {
	// 	method: 'GET',
	// 	headers: { ...HEADERS, 'Authorization': `Bearer ${token}`},
	// 	}).then(response => response.json())
	// 	.then(data => console.log(data)).catch(()=>{})
	// }, [])
	
	function onClick() {
		searchParams.set('roomLocation', location)
		searchParams.set('roomId', roomData.id.toString())
		setSearchParams(searchParams, {replace: true})
	}
	return (
		<ChannelContextMenu channel={'channel name'}>
			<div className='Chat__channels__bubble' onClick={onClick}></div>
		</ChannelContextMenu>
	)
}


export default function AllChannel({channels}: {channels: RoomData[]}) {

	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
	const [open, setOpen] = useState<boolean>(false)

	function onClick(e: React.MouseEvent) {
		e.stopPropagation()
		if (windowDimensions.width <= 700)
			setOpen(!open)
	}
	function hide() {
		if (windowDimensions.width <= 700)
			setOpen(false)
	}
	useEffect(() => {
		if (windowDimensions.width > 700)
			setOpen(true)
	}, [windowDimensions])

	var [searchParams, setSearchParams] = useSearchParams()
	
	function goHome() {
		searchParams = sanitizeQuery(searchParams)
		searchParams.delete('roomId')
		searchParams.delete('p_msg')
		searchParams.set('roomLocation', 'home')
		setSearchParams(searchParams)
	}
	function leaveChat() {
		searchParams = sanitizeQuery(searchParams)
		searchParams.delete('chat')
		setSearchParams(searchParams)
	}
	return (
		<div className='Chat__channels--container' onClick={hide}>
			<div className='Chat__channels' onClick={hide}>
				{windowDimensions.width <= 700 &&
					<img src={ret} alt='' className='Chat__channels__return' onClick={leaveChat}/>}
				<img src={home} alt='' className='Chat__channels__return' onClick={goHome}/>
				{open &&
				<>
					<hr/>
					{channels.map((channel: any)=><ChatBubble roomData={channel} location={'room/home'}/>)}
				</>
				}
				{windowDimensions.width <= 700 &&
				<div className='Chat__channels__image' onClick={onClick}>
					{open ? <img src={arrow} alt='' style={{transform: 'rotate(90deg)'}}/>
					: <img src={arrow} alt='' style={{transform: 'rotate(-90deg)'}}/>}
				</div>
				}
			</div>
		</div>
	)
}
