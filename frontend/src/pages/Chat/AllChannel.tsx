import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChannelContextMenu, getWindowDimensions } from './Chat'
import arrow from '../../images/arrow.svg'
import ret from '../../images/return.svg'
import home from '../../images/home.svg'
import { sanitizeQuery } from '../../lib/queryString'

function ChatBubble({ name='', roomId, location }
: {name?: string, roomId?: string, location: string}) {

	var [searchParams, setSearchParams] = useSearchParams()
	function onClick() {
		searchParams.set('roomLocation', location)
		if (roomId)
			searchParams.set('roomId', roomId)
		else
		{
			//reset
			searchParams.delete('roomId')
			searchParams.delete('p_msg')
		}
		setSearchParams(searchParams, {replace: true})
	}
	return (
		<ChannelContextMenu channel={'channel name'}>
			<div className='Chat__channels__bubble' onClick={onClick}>{name}</div>
		</ChannelContextMenu>
	)
}


export default function AllChannel() {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
	const [open, setOpen] = useState<boolean>(false)

	function onClick(e: React.MouseEvent) {
		e.stopPropagation()
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
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
					<ChatBubble roomId={'very good room'} location={'room/home'}/>
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
