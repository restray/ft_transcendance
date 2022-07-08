import React, { useContext, useEffect, useRef, useState } from 'react'
import ModalBox from '../../component/ModalBox';
import ProfilBox, { NameWithMenu } from '../../component/ProfilBox';
import menu from '../../images/menu.svg'
import chat from '../../images/chat.svg'
import arrow from '../../images/arrow.svg'
import friendAdd from '../../images/friendAdd.svg'
import useContextMenu from '../../lib/generateMenu';
import InvisibleInput, { InvisibleInputSelect } from '../../component/InvisibleInput';
import { useSearchParams } from 'react-router-dom';
import ChatUi from './Message';
import { ChannelParameter } from './Settings';
import { AnimatePresence, motion } from 'framer-motion'
import AllChannel from './AllChannel';
import { HEADERS } from '../..';
import { UserContext, UserContextValue } from '../../context/userContext';

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

function FriendList({friends}: {friends: []}) {

	return (
		<div className='FriendList--container'>
			<div className='FriendList'>
				<h1>Friend list</h1>
				<p>Pending: </p>
				{friends.map((friend: any, index: number)=>{
					if (friend.status === 'WAITING')
						return <FriendListFriend key={index} name={friend.receiver.name} pending={true}/>
					return <></>
				})}
				<p>Friends: </p>
				{friends.map((friend: any, index: number)=>{
					if (friend.status === 'ACCEPTED')
						return <FriendListFriend key={index} name={friend.receiver.name}/>
					return <></>
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

	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
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
								return <ProfilBox name={user.user.name} cName={'RoomUsers__section__profile'} precClass={'RoomUsers__section__profile--red'}/>
						})}
					</div>

					<div className='RoomUsers__section'>
						<div className='RoomUsers__section__name'>
							Users -
						</div>
						{rData.users.map((user: any)=>{
							if (user.state === 'USER')
								return <ProfilBox name={user.user.name} cName={'RoomUsers__section__profile'} />
						})}
					</div>
			</motion.div>
			}
			</AnimatePresence>
		</div>
	)
}
export function ChannelContextMenu({ children, channel, isOnClick=false }:
{ children: JSX.Element, channel: string, isOnClick?: boolean }) {

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
				searchParams.set('roomLocation', 'room/settings')
				setSearchParams(searchParams)
			}
		},
		{
			name: 'Leave channel',
			func: function renamePage() {
			}
		}
	])
	if (isOnClick)
		return (
			<div
			onContextMenu={(e)=>generateMenu(e)}
			onClick={(e)=>generateMenu(e)}
			>{children}</div>
		)
	return (
		<div onContextMenu={(e)=>generateMenu(e)}>{children}</div>
	)
}

interface Room {
	name: string
}

export function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height
	};
}

export interface RoomData {

	id: number,
	name: string,
	messages: [],
	ownerId: 1,
	password: null | string,
	type: string,
	users: []
}

export default function Chat() {
	var [searchParams, setSearchParams] = useSearchParams()
	const [rData, setRData] = useState<RoomData | null>(null)
	const [friends, setFriends] = useState<[]>([])
	const [channels, setChannels] = useState<RoomData[]>([])

	const { token } = useContext(UserContext) as UserContextValue

	/* get all data needed */
	useEffect(()=>{
		fetch(`http://localhost:3000/friends`, {
		method: 'GET',
		headers: { ...HEADERS, 'Authorization': `Bearer ${token}`},
		}).then(response => response.json())
		.then(data => {
			setFriends(data)
		}).catch(()=>{})
	}, [])

	async function getChannelMessage(roomId: string): Promise<RoomData> {

		var response = await fetch(`http://localhost:3000/channels/${roomId}?start=0&end=0`, {
		method: 'GET',
		headers: { ...HEADERS, 'Authorization': `Bearer ${token}`},
		})
		var data: Promise<RoomData> = response.json()
		return data
	}

	// useEffect(()=>{
	// 	console.log(channels)
	// }, [channels])

	useEffect(()=>{
		
		const fetchData = async () => {
			var response = await fetch(`http://localhost:3000/channels`, {
			method: 'GET',
			headers: { ...HEADERS, 'Authorization': `Bearer ${token}`},
			})
			var data = await response.json()
			var loadedChannels: RoomData[] = []
			for (var room of data) {
				var rData = await getChannelMessage(room.id)
				loadedChannels.push(rData)
			}
			setChannels(loadedChannels)
		}
		fetchData()
	}, [])
	/* get all data needed */

	useEffect(() => {
		var roomId: string | null = searchParams.get('roomId')
		if (roomId === null)
		{
			setRData(null)
			return
		}
		var rId: number = parseInt(roomId)
		var newRData = channels.find((data: RoomData)=> data.id === rId )
		if (newRData === undefined)
		{
			setRData(null)
			return
		}
		setRData(newRData)
	}, [searchParams])
	
	return (
		<ModalBox noTop={true}>
			<div className='Chat'>
				<AllChannel channels={channels}/>
				
				<div className='Chat__right'>
					{rData && <ChannelContextMenu channel={'channel name'} isOnClick={true}>
						<div className='Chat__right__roomName'>
							<div className='Chat__right__roomName__image'></div>
							{rData.name}
							<img className='Chat__right__roomName__menu' src={menu} alt='' />
						</div>
					</ChannelContextMenu>}

					{getChannelRoute(searchParams.get('roomLocation'), friends, rData)}
				</div>
			</div>
		</ModalBox>
	)
}

function getChannelRoute(route: string | null, friends: [], rData: RoomData | null) {
	if (route === null || route === 'home')
		return (<ChatHome friends={friends}/>)
	else if (route === 'room/home')
		return (<ChatChannelHome rData={rData}/>)
	else if (route === 'room/settings')
		return (<ChatChannelParameter />)
	else if (route === 'room/join')
		return (<ChatChannelJoin />)
	else
		return (<ChatHome friends={friends}/>)
}
		

/* pages */
function ChatHome({friends}: {friends: []}) {

	var [searchParams, setSearchParams] = useSearchParams()

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
