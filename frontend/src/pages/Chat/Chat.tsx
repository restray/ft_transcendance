import React, { useContext, useEffect, useRef, useState } from 'react'
import ModalBox from '../../component/ModalBox';
import ProfilBox, { NameWithMenu } from '../../component/ProfilBox';
import chat from '../../images/chat.svg'
import arrow from '../../images/arrow.svg'
import menu from '../../images/menu.svg'
import bin from '../../images/bin.svg'
import add from '../../images/friendAdd.svg'
import block from '../../images/block.svg'
import useContextMenu from '../../lib/generateMenu';
import InvisibleInput from '../../component/InvisibleInput';
import { useSearchParams } from 'react-router-dom';
import ChatUi from './Message';
import { ChannelParameter } from './Settings';
import { AnimatePresence, motion } from 'framer-motion'
import AllChannel, { CreateServerModal } from './AllChannel';
import { ChatContext, ChatProvider, ChatValue, RoomData, User } from '../../context/chatContext';
import { Friend, FriendsContext, FriendsContextValue } from '../../context/friendsContext';

function FriendListFriend({user, state}: {user: User, state: 'WAITING' | 'SEND_WAITING' | 'ACCEPTED' | 'BLOCKED'}) {

	const {chatLink} = useContext(ChatContext) as ChatValue
	const {acceptFriend, removeLink} = useContext(FriendsContext) as FriendsContextValue

	var image = (()=>{
		if (state === 'WAITING') return add
		if (state === 'SEND_WAITING') return bin
		if (state === 'BLOCKED') return block
		return chat
	})()
	var event = (()=>{
		if (state === 'SEND_WAITING' || state === 'BLOCKED') return removeLinkEvent
		if (state === 'WAITING') return acceptFriendEvent
		return ()=>{}
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

	return (
		<div className='FriendList__friend' onClick={event}>
			<div className='FriendList__friend__profile'>
				<img src={user.avatar} alt='' className='FriendList__friend__profile__image' />
				<NameWithMenu user={user} link={chatLink} />
			</div>
			<img className='FriendList__friend__chat' src={image} alt=''/>
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
						return <FriendListFriend key={index} user={friend.user} state={'ACCEPTED'}/>
					return null
				})}
				<p>Request received: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'WAITING')
						return <FriendListFriend key={index} user={friend.user} state={'WAITING'}/>
					return null
				})}
				<p>Request sended: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'SEND_WAITING')
						return <FriendListFriend key={index} user={friend.user} state={'SEND_WAITING'}/>
					return null
				})}
				<p>Blocked: </p>
				{friends.map((friend: Friend, index: number)=>{
					if (friend.state === 'BLOCKED')
						return <FriendListFriend key={index} user={friend.user} state={'BLOCKED'}/>
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

function RoomUsers({rData}: {rData: RoomData}) {

	const [windowDimensions] = useState(getWindowDimensions())
	const [open, setOpen] = useState<boolean>(false)
	const {chatLink} = useContext(ChatContext) as ChatValue

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
							console.log(user)
							if (user.state === 'ADMIN')
								return <ProfilBox link={chatLink} key={user.user.id} user={user.user} cName={'RoomUsers__section__profile'} precClass={'RoomUsers__section__profile--red'}/>
							return null
						})}
					</div>

					<div className='RoomUsers__section'>
						<div className='RoomUsers__section__name'>
							Users -
						</div>
						{rData.users.map((user: any)=>{
							if (user.state === 'USER')
								return <ProfilBox link={chatLink} key={user.user.id} user={user} cName={'RoomUsers__section__profile'} />
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
				setLeaveModal(true)
			}
		}
	])

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

	if (rData === null || route === null || route === 'home')
		return (<ChatHome/>)
	else if (route === 'room/home')
		return (<ChatChannelHome rData={rData}/>)
	else if (route === 'room/settings')
		return (<ChatChannelParameter />)
	else if (route === 'room/join')
		return (<ChatChannelJoin />)
	return (<ChatHome/>)
}
		

/* pages */
function ChatHome() {

	var [searchParams] = useSearchParams()

	return (
		<div className='Chat__right__room'>
		{searchParams.has('p_msg') ? <ChatUi /> : <FriendList />}
		</div>
	)
}


function ChatChannelHome({rData}: {rData: RoomData}) {

	return (
		<div className='Chat__right__room'>
		<ChatUi />
		<RoomUsers rData={rData}/>
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
