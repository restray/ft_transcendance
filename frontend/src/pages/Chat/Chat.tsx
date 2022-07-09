import React, { useContext, useEffect, useState } from 'react'
import ModalBox from '../../component/ModalBox';
import ProfilBox, { NameWithMenu } from '../../component/ProfilBox';
import chat from '../../images/chat.svg'
import arrow from '../../images/arrow.svg'
import menu from '../../images/menu.svg'
import friendAdd from '../../images/friendAdd.svg'
import useContextMenu from '../../lib/generateMenu';
import InvisibleInput from '../../component/InvisibleInput';
import { useSearchParams } from 'react-router-dom';
import ChatUi from './Message';
import { ChannelParameter } from './Settings';
import { AnimatePresence, motion } from 'framer-motion'
import AllChannel, { CreateServerModal } from './AllChannel';
import { ChatContext, ChatProvider, ChatValue, RoomData } from '../../context/chatContext';

function FriendListFriend({name, pending}: {name: string, pending?: boolean}) {

	var [searchParams, setSearchParams] = useSearchParams()

	function onClick() {
		if (pending) {
			console.log('accept ' + name + ' as friend')
			return
		}
		searchParams.set('p_msg', name)
		setSearchParams(searchParams, {replace: true})
	}

	return (
		<div className='FriendList__friend' onClick={onClick}>
			<div className='FriendList__friend__profile'>
				<div className='FriendList__friend__profile__image' />
				<NameWithMenu name={name} />
			</div>
			{pending ?
			<img className='FriendList__friend__chat' src={friendAdd} alt=''/>
			:
			<img className='FriendList__friend__chat' src={chat} alt=''/>
			}
		</div>
	)
}

function FriendList({friends}: {friends: any[]}) {

	return (
		<div className='FriendList--container'>
			<div className='FriendList'>
				<h1>Friend list</h1>
				<p>Pending: </p>
				{friends.map((friend: any, index: number)=>{
					if (friend.status === 'WAITING')
						return <FriendListFriend key={index} name={friend.receiver.name} pending={true}/>
					return null
				})}
				<p>Friends: </p>
				{friends.map((friend: any, index: number)=>{
					if (friend.status === 'ACCEPTED')
						return <FriendListFriend key={index} name={friend.receiver.name}/>
					return null
				})}
				{/* <p>BLOCKED: </p>
				{friends.map((friend: any)=>{
					if (friend.status === 'BLOCKED' && friend.requester.name === '')
						return <FriendListFriend name={friend.receiver.name}/>
					return <></>
				})} */}
			</div>
		</div>
	)
}

function ChannelJoin() {

	var message = 'This is a private room, you need to be invited!'
	const [pass, setPass] = useState<string>('')
	return (
		<div className='JoinRoom'>
			<div className='JoinRoom--container'>
				<div className='JoinRoom__image'></div>
				<div className='JoinRoom__name'>SUPER NAME ROOM</div>
				<div className='JoinRoom__message'>{message}</div>
				<InvisibleInput name={'Pass for room'} value={pass} setValue={setPass} />
				<button className='smallButton'>Join Us</button>
			</div>
		</div>
	)
}

function RoomUsers({rData}: {rData: RoomData}) {

	const [windowDimensions] = useState(getWindowDimensions())
	const [open, setOpen] = useState<boolean>(false)

	useEffect(()=>{
		if (windowDimensions.width > 700)
			setOpen(true)
	}, [windowDimensions])
	function onClick() {
		setOpen(!open)
	}
	return (
		<div className='RoomUsers--container'>
			{windowDimensions.width <= 700 && <div className='RoomUsers__openButton' onClick={onClick}>
					{open ? <img src={arrow} alt='' style={{transform: 'rotate(180deg)'}}/>
					: <img src={arrow} alt='' /> }
				</div>
			}
			<AnimatePresence>
			{open &&
				<motion.div
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				exit={{ scaleX: 0 }}
				style={{ transformOrigin: 'center right' }}
				className='RoomUsers'>
					{/* <div className='RoomUsers__section'>
						<div className='RoomUsers__section__name'>
							Super Admin -
						</div>
						<ProfilBox name={'pleveque'} cName={'RoomUsers__section__profile'} precClass={'RoomUsers__section__profile--red'}/>
					</div> */}

					<div className='RoomUsers__section'>
						<div className='RoomUsers__section__name'>
							Admins -
						</div>
						{rData.users.map((user: any)=>{
							if (user.state === 'ADMIN')
								return <ProfilBox key={user.user.id} name={user.user.name} cName={'RoomUsers__section__profile'} precClass={'RoomUsers__section__profile--red'}/>
							return null
						})}
					</div>

					<div className='RoomUsers__section'>
						<div className='RoomUsers__section__name'>
							Users -
						</div>
						{rData.users.map((user: any)=>{
							if (user.state === 'USER')
								return <ProfilBox key={user.user.id} name={user.user.name} cName={'RoomUsers__section__profile'} />
							return null
						})}
					</div>
			</motion.div>
			}
			</AnimatePresence>
		</div>
	)
}
export function ChannelContextMenu({ children, channel, isOnClick=false, roomData }:
{ children: JSX.Element, channel: string, isOnClick?: boolean, roomData: RoomData }) {

	const {leaveChannel, setLocation} = useContext(ChatContext) as ChatValue

	var [searchParams, setSearchParams] = useSearchParams()
	const generateMenu = useContextMenu([
		{
			name: 'Create Invitation',
			func: function renamePage() {
				console.log("weq");
			}
		},
		{
			name: 'Channel settings',
			func: function renamePage() {
				setLocation('room/settings', roomData.id)
			}
		},
		{
			name: 'Leave channel',
			func: function leaveChannel() {
				console.log('leave')
				setLeaveModal(true)
			}
		}
	])

	/* modals */
	const [leaveModal, setLeaveModal] = useState<boolean>(false)
	function onClickLeaveChannel() {
		leaveChannel(roomData.id, ()=>{setLeaveModal(false)})
	}
	// if (isOnClick)
	// 	return (
	// 		<div
	// 		onContextMenu={(e)=>generateMenu(e)}
	// 		onClick={(e)=>generateMenu(e)}
	// 		>
	// 			{leaveModal && <CreateServerModal modal={leaveModal} setModal={setLeaveModal}
	// 				onCreate={onClickLeaveChannel} message={`Do you really want to leave "${roomData.name}"?`}
	// 			title={'Leave room'} />}
	// 			{children}
	// 		</div>
	// 	)
	return (
		<div onContextMenu={(e)=>generateMenu(e)}>
			{leaveModal && <CreateServerModal modal={leaveModal} setModal={setLeaveModal}
					onCreate={onClickLeaveChannel} message={`Do you really want to leave "${roomData.name}"?`}
				title={'Leave room'} />}
			{children}
		</div>
	)
}

// interface Room {
// 	name: string
// }

export function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height
	};
}

export default function Chat() {

	return (
		<ChatProvider>
			<ChatContent />
		</ChatProvider>
	)
}

function Loader({loaded}: {loaded: Map<string, boolean>}) {

	var load = 0
	var total = 0
	for (let l of loaded.values()) {
		if(l)
			++load
		++total
	}
	return (
		<div style={{
			fontSize: '40px',
			width: '100%',
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'column'
		}}>
			<div>loading</div>
			<div>{load}/{total}</div>
		</div>
	)
}

function ChatContent() {

	var [searchParams] = useSearchParams()
	const {content: {friends, rData, state: {location}}, loaded} = useContext(ChatContext) as ChatValue

	function isFullLoad() {
		for (var value of loaded.values()) {
			if (!value)
				return false
		}
		return true
	}
	useEffect(()=>{
		console.log(location)
	}, [location])

	return (
		<ModalBox noTop={true}>
			<div className='Chat'>
				{!isFullLoad() ?
				<Loader loaded={loaded}/>
				:
				<>
					<AllChannel />
					
					<div className='Chat__right'>
						{rData && <ChannelContextMenu channel={'channel name'} isOnClick={true} roomData={rData}>
								<div className='Chat__right__roomName'>
									<div className='Chat__right__roomName__image'></div> 
									{rData.name}
									<img className='Chat__right__roomName__menu' src={menu} alt='' />
								</div>
						</ChannelContextMenu>}

						{getChannelRoute(location, friends, rData)}
					</div>
				</>}
			</div>
		</ModalBox>
	)
}

function getChannelRoute(route: string | null, friends: any[], rData: RoomData | null) {

	if (route === null || route === 'home')
		return (<ChatHome friends={friends}/>)
	else if (route === 'room/home')
		return (<ChatChannelHome rData={rData}/>)
	else if (route === 'room/settings')
		return (<ChatChannelParameter />)
	else if (route === 'room/join')
		return (<ChatChannelJoin />)
	return (<ChatHome friends={friends}/>)
}
		

/* pages */
function ChatHome({friends}: {friends: any[]}) {

	var [searchParams] = useSearchParams()

	return (
		<div className='Chat__right__room'>
		{searchParams.has('p_msg') ? <ChatUi /> : <FriendList friends={friends}/>}
		</div>
	)
}


function ChatChannelHome({rData}: {rData: RoomData | null}) {

	return (
		<div className='Chat__right__room'>
		<ChatUi />
		{rData !== null && <RoomUsers rData={rData}/>}
		</div>
	)
}

function ChatChannelParameter() {
	return (
		<div className='Chat__right__room'>
		<ChannelParameter />
		{/* <RoomUsers /> */}
		</div>
	)
}

function ChatChannelJoin() {
	return (
		<div className='Chat__right__room'>
		<ChannelJoin />
		</div>
	)
}
