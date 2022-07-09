import React, {createContext, useReducer, useCallback, useContext, useEffect, useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import fetchWithToken, { checkToken } from '../lib/fetchImprove';
import { chatReducer } from '../reducer/ChatReducer';
import { UserContext, UserContextValue, UserContextValueState } from './userContext';
export const ChatContext = createContext<ChatValue | null>(null);

export interface RoomData {

	id: number,
	name: string,
	messages: [],
	ownerId: number,
	password: null | string,
	type: string,
	users: []
}

export interface ChatState {

	friends: any[],
	channels: RoomData[],
	rData: RoomData | null,
	state: {
		location: string
	}
}

export interface ChatValue {

	content: ChatState,
	createChannel: (a: ()=>void)=>void,
	loaded: Map<string, boolean>,
	sendMessage: (message: string)=>void,
	setLocation: (location: string, id?: number | undefined)=>void,
	leaveChannel: (id: number, callback?: ()=>(void))=>void
}

interface PayloadChatAction extends ChatState {
	
	roomId: number | null
	channel: any,
	message: string,
	location: string,
	id: number,
	user: UserContextValueState
}

export interface ChatAction {

	type: string,
	payload: Partial<PayloadChatAction>
}

export const ChatProvider = ( {children}: { children: JSX.Element} ) => {
	const initialeState: ChatState = {
		friends: [],
		channels: [],
		rData: null,
		state: {
			location: '/home'
		}
	}
	const [chatValue, dispatch] = useReducer(chatReducer, initialeState)
	const {token, deleteToken, content: user} = useContext(UserContext) as UserContextValue
	var [searchParams] = useSearchParams()
	const [loaded] = useState(new Map ([
		['friends', false],
		['channels', false],
	]))

	/* reducer */
	const setFriends = useCallback(
	(friends: any[]) => {
		dispatch({type: "SET_FRIENDS", payload: {friends}
	});
	}, [dispatch])
	
	const setChannels = useCallback(
	(channels: RoomData[]) => {
		dispatch({type: "SET_CHANNELS", payload: {channels}
	});
	}, [dispatch])

	const addChannel = useCallback(
	(channel: any) => {
		dispatch({type: "ADD_CHANNEL", payload: {channel}
	});
	}, [dispatch])

	const leaveChannel = useCallback(
	(id: number, callback?: ()=>(void)) => {
		dispatch({type: "DELETE_CHANNEL", payload: {id}})
		if (callback) {callback()}
	}, [dispatch])

	const addMessage = useCallback(
	(message: string, roomId: number) => {
		dispatch({type: "ADD_MESSAGE", payload: {message, roomId}
	});
	}, [dispatch])

	// const setRoomData = useCallback(
	// (roomId: number | null) => {
	// 	dispatch({type: "SET_ROOM_DATA", payload: {roomId}
	// });
	// }, [dispatch])

	const setLocation = useCallback(
		(location: string, id?: number | undefined) => {
			dispatch({type: "SET_LOCATION", payload: {location, id, user}
		});
	}, [dispatch, user])
	/* end reducer */

	/* load all datas */
	useEffect(()=>{

		checkToken(token, 
			(token: string)=>fetchWithToken<any>({token, deleteToken, url: `/friends`, callback: (data: any)=>{
				setFriends(data)
				loaded.set('friends', true)
			}})
		)
	}, [token, setFriends, loaded, deleteToken])

	const setLoadedChannels = useCallback(
		

		async function setLoadedChannelsCallback(data: any) {

			if (!token)
				return
	
			var loadedChannels: RoomData[] = []
			for (var room of data) {
				var rData = await fetchWithToken<RoomData>({token, deleteToken, url: `/channels/${room.id}?start=0&count=50`})
				loadedChannels.push(rData)
			}
			setChannels(loadedChannels)
			loaded.set('channels', true)
		},
		[token, setChannels, loaded, deleteToken]
	)
	
	useEffect(()=>{
		
		checkToken(token, 
		(token: string)=>fetchWithToken<any>({
			token,
		 	deleteToken,
			url: `/channels`, 
			callback: (data: any)=>{setLoadedChannels(data)}
		}))
	}, [token, setLoadedChannels, deleteToken])

	// useEffect(() => {
	// 	var roomId: string | null = searchParams.get('roomId')
	// 	if (roomId === null)
	// 		setRoomData(null)
	// 	else
	// 		setRoomData(toInteger(roomId))
	// 	loaded.set('rData', true)
	// }, [searchParams, setRoomData, loaded])
	/* end load datas */

	/* events */
	const createChannel = useCallback(
		function createChannelCallback(callback: ()=>void) {
			console.log('hey creating channel, please wait...')
			checkToken(token, 
				(token: string)=>fetchWithToken<any>({token, deleteToken, url: `/channels`, method: 'POST',
					body: {
						name: 'super channel',
						type: 'PUBLIC',
						password: ''
					},
					callback: (data: any)=>{
						console.log(data)
						// addChannel(data)
						callback()
					}})
			)
		}
	, [token, deleteToken])

	/* end events */

	/* sockets */
	const [ioChannels, setIoChannels] = useState<Socket<any, any> | null>(null)

	interface Message {
		channel: number,
		message: string,
		user: User
	}
	interface User {
		avatar: string,
		id: number,
		name: string
	}
	useEffect(()=>{
		const newIoChannels = io("ws://localhost:3000/channels", { auth: { token }})

		newIoChannels.on("connect", () => {
			console.info("Socket channels status is connected!")
		});

		newIoChannels.on('message', (info) => {
			console.log("message", info)
			// addMessage(info, info.channel)s
		})

		newIoChannels.on('join', (info) => {
			console.log("join", info)
			// addMessage(info, info.channel)
		})

		newIoChannels.on('leave', (info) => {
			console.log("leave", info)
			// addMessage(info, info.channel)
		})

		setIoChannels(newIoChannels)

	}, [token, addMessage])

	useEffect(() => {
		return () => {
			if (ioChannels)
			{
				ioChannels.disconnect()
				console.log('disconnect socket')
				setIoChannels(null)
			}
		}
	}, [ioChannels])
	
	const sendMessage = useCallback(
	function sendMessageCallback(message: string) {
		// console.log(`send message: ${message}`)
		// console.log(chatValue.rData.id)
		if (ioChannels && chatValue.rData) {
			ioChannels.emit("message", {
					channel: 1,
					message: message
				}, (response: any) => {
					console.log(response); // ok
				});
			}
	}, [ioChannels, chatValue.rData])
	
	/* end sockets */

	/////////////////////////////////////

	const value: ChatValue = {
		content: chatValue,
		createChannel: createChannel,
		loaded: loaded,
		sendMessage: sendMessage,
		setLocation: setLocation,
		leaveChannel: leaveChannel
	}
	return (
		<ChatContext.Provider value={value}>
			{children}
		</ChatContext.Provider>
	)
}