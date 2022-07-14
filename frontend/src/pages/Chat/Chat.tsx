import React, { useContext, useEffect, useRef, useState } from 'react'
import ModalBox from '../../component/ModalBox';
import ProfilBox, { NameWithMenu } from '../../component/ProfilBox';
import unblock from '../../images/unblock.svg'
import menu from '../../images/menu.svg'
import bin from '../../images/bin.svg'
import addFriendSvg from '../../images/friendAdd.svg'
import send from '../../images/send.svg'
import useContextMenu from '../../lib/generateMenu';
import InvisibleInput from '../../component/InvisibleInput';
import { useSearchParams } from 'react-router-dom';
import ChatUi from './Message';
import { ChannelParameter } from './Settings';
import { AnimatePresence, motion } from 'framer-motion'
import AllChannel, { CreateServerModal } from './AllChannel';
import { ChatContext, ChatProvider, ChatValue, RoomData, User } from '../../context/chatContext';
import { Friend, FriendsContext, FriendsContextValue } from '../../context/friendsContext';
import { BACKEND_HOSTNAME } from '../../envir';
import { useRoomProfilTools, useRoomSettingsTools } from '../../context/userMenu';
import { RoomUsers } from './Room';

export function FriendColorStatus({children, friend}: {children: React.ReactElement, friend: Friend}) {

	return (
		<div className={`FriendStatus--${friend.status}`}>
			{children}
		</div>
	)
}

function FriendListFriend({friend, friend: {user}, state}: {friend: Friend, state: 'WAITING' | 'SEND_WAITING' | 'ACCEPTED' | 'BLOCKED'}) {

	const {chatLink, openPrivateMessage} = useContext(ChatContext) as ChatValue
	const {acceptFriend, removeLink} = useContext(FriendsContext) as FriendsContextValue

	var menu = (()=>{
		var link = friend.state
		if (link === 'WAITING') 
			return (
				<div>
					<img className='FriendList__friend__event' src={addFriendSvg} alt='' onClick={acceptFriendEvent}/>
					<img className='FriendList__friend__event' src={bin} alt='' onClick={removeLinkEvent}/>
				</div>
			)
		if (link === 'SEND_WAITING')
			return (<img className='FriendList__friend__event' src={bin} alt='' onClick={removeLinkEvent}/>)
		if (link === 'BLOCKED')
			return (<img className='FriendList__friend__event' src={unblock} alt='' onClick={removeLinkEvent}/>)
		return (
			<img className='FriendList__friend__event' src={send} alt=''
			onClick={openPrivateMessageEvent}/>
		)
	})()

	// addFriend,
	// blockUser,
	// acceptFriend,
	// removeLink
	function acceptFriendEvent() {
		acceptFriend(user.id)
	}
	function removeLinkEvent() {
		removeLink(user.id)
	}
	function openPrivateMessageEvent() {
		openPrivateMessage(user.id)
	}

	return (
		<div className='FriendList__friend'>
			<div className='FriendList__friend__profile'>
				<FriendColorStatus friend={friend}>
					<img src={`${BACKEND_HOSTNAME}/${user.avatar}`} alt='' className='FriendList__friend__profile__image' />
				</FriendColorStatus>
			
				<NameWithMenu user={user} link={chatLink} />
			</div>
			{menu}
		</div>
	)
}

function FriendList() {
	const {state: {friends} } = useContext(FriendsContext) as FriendsContextValue

	return (
		<div className='FriendList--container'>
			<div className='FriendList'>
				<h1>Friend list</h1>
				<p>Friends: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'ACCEPTED')
						return <FriendListFriend key={index} friend={friend} state={'ACCEPTED'}/>
					return null
				})}
				<p>Request received: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'WAITING')
						return <FriendListFriend key={index} friend={friend} state={'WAITING'}/>
					return null
				})}
				<p>Request sended: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'SEND_WAITING')
						return <FriendListFriend key={index} friend={friend} state={'SEND_WAITING'}/>
					return null
				})}
				<p>Blocked: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'BLOCKED')
						return <FriendListFriend key={index} friend={friend} state={'BLOCKED'}/>
					return null
				})}
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

export function ChannelContextMenu({ children, channel, isOnClick=false, roomData }:
{ children: JSX.Element, channel: string, isOnClick?: boolean, roomData: RoomData }) {

	const {leaveChannel} = useContext(ChatContext) as ChatValue

	const generateMenu = useContextMenu([...useRoomSettingsTools({rData: roomData})])

	/* modals */
	const [leaveModal, setLeaveModal] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(()=>{
		if (leaveModal === false)
			setError(null)		
	}, [leaveModal])

	function onClickLeaveChannel() {
		setIsLoading(true)
		leaveChannel(roomData.id, (data: any)=>{
			setIsLoading(false)
			if (data.statusCode !== 200)
				setError(data.message)
			else
				setLeaveModal(false)
		})
	}
	return (
		<div onContextMenu={(e)=>generateMenu(e)} onClick={(e)=>{
			if (isOnClick) generateMenu(e)
		}}>
			<CreateServerModal modal={leaveModal} setModal={setLeaveModal}
				isLoading={isLoading} error={error}
				onCreate={onClickLeaveChannel} message={`Do you really want to leave "${roomData.name}"?`}
				title={'Leave room'} />
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

export default function Chat() {

	const {content: {rData, state: {location}}, loaded} = useContext(ChatContext) as ChatValue

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

						{getChannelRoute(location, rData)}
					</div>
				</>}
			</div>
		</ModalBox>
	)
}

function getChannelRoute(route: string | null, rData: RoomData | null) {

	if (route === null || route === 'home')
		return (<ChatHome/>)
	else if (route === 'room/home' && rData)
		return (<ChatChannelHome/>)
	else if (route === 'room/settings')
		return (<ChatChannelParameter />)
	else if (route === 'room/join')
		return (<ChatChannelJoin />)
	else if (route === 'privateMessage')
		return (<ChatPrivateMessage />)
	return (<ChatHome/>)
}
		

/* pages */
function ChatHome() {

	return (
		<div className='Chat__right__room'>
		<FriendList />
		</div>
	)
}

function ChatPrivateMessage() {

	return (
		<div className='Chat__right__room'>
			<ChatUi />
		</div>
	)
}

function ChatChannelHome() {

	return (
		<div className='Chat__right__room'>
		<ChatUi />
		<RoomUsers/>
		</div>
	)
}

function ChatChannelParameter() {
	return (
		<div className='Chat__right__room'>
		<ChannelParameter />
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
