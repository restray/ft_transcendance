import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChannelContextMenu, getWindowDimensions } from './Chat'
import arrow from '../../images/arrow.svg'
import ret from '../../images/return.svg'
import add from '../../images/add.svg'
import home from '../../images/home.svg'
import { sanitizeQuery } from '../../lib/queryString'
import Modal from '../../component/Modal'
import { ChatContext, ChatValue, RoomData } from '../../context/chatContext'

export function CreateServerModal({modal, setModal, onCreate, message, title}
: {modal: boolean, setModal: (a: boolean)=>void, onCreate: ()=>void, message: string, title: string}) {

	function close() {
		setModal(false)
	}
	return (
		<Modal open={modal} setOpen={setModal}>
			<div className='ModalBox' style={{overflow:'unset'}}>
				<div className='ModalBox__title'>{title}</div>
				<div className='ModalBox__content' style={{textAlign: 'center'}}>{message}</div>
				<div className='ModalBox__bottomBox ModalBox__bottomBox' onClick={onCreate}>Yes!</div>
				<div className='ModalBox__bottomBox ModalBox__bottomBox--b' onClick={close}>no!</div>
			</div>
		</Modal>
	)
}

function ChatBubble({ roomData, setLocation }
: {roomData: RoomData, setLocation: (location: string, id?: number | undefined)=>void}) {

	function onClick() {
		setLocation('room/home', roomData.id)
	}

	return (
		<ChannelContextMenu channel={'channel name'} roomData={roomData}>
			<div className='Chat__channels__bubble' onClick={onClick}></div>
		</ChannelContextMenu>
	)
}


export default function AllChannel() {

	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
	const [open, setOpen] = useState<boolean>(false)
	const [createModal, setCreateModal] = useState<boolean>(false)
	const {content: {channels}, createChannel, setLocation} = useContext(ChatContext) as ChatValue

	/* responsive */
	
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

	/* end responsive */

	var [searchParams, setSearchParams] = useSearchParams()
	
	function goHome() {
		setLocation('home')
	}
	function leaveChat() {
		searchParams = sanitizeQuery(searchParams)
		searchParams.delete('chat')
		setSearchParams(searchParams)
	}
	function openModal(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation()
		setCreateModal(true)
	}
	// {
	// 	"name": "Nom de channel",
	// 	"type": "PUBLIC",
	// 	"password": "string"
	// }
	function onClickCreateChannel() {
		createChannel(()=>setCreateModal(false))
	}
	return (
		<div className='Chat__channels--container' onClick={hide}>
			<CreateServerModal modal={createModal} setModal={setCreateModal} onCreate={onClickCreateChannel}
			message={"Do you want to create a new room?"} title={'New Room'} />

			<div className='Chat__channels' onClick={hide}>
				{windowDimensions.width <= 700 &&
					<img src={ret} alt='' className='Chat__channels__return' onClick={leaveChat}/>}
				<img src={home} alt='' className='Chat__channels__return' onClick={goHome}/>
				{open &&
				<>
					<hr/>
					{channels.map((channel: any, index: number)=><ChatBubble key={index} roomData={channel} setLocation={setLocation}/>)}
					<img src={add} alt='' className='Chat__channels__return' onClick={openModal}/>
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
