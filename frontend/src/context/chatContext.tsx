import React, {createContext, useReducer, useCallback, useContext, useEffect, useState} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { HEADERS } from '..';
import { BACKEND_HOSTNAME } from '../envir';
import fetchWithToken, { checkToken, protectedFetch } from '../lib/fetchImprove';
import { chatReducer } from '../reducer/ChatReducer';
import { UserContext, UserContextValue } from './userContext';
export const ChatContext = createContext<ChatValue | null>(null);

export interface RoomData {
	id: number,
	name: string,
	messages: MessageType[],
	ownerId: number,
	type: string,
	users: RoomUser[]
}
export interface RoomUser {
	state: string,
	user: User
}
export interface User {
	avatar: string,
	id: number,
	name: string,
	// status: string
}
export interface ConnectedUser extends User {
	otp_enable: boolean
}
export interface MessageType {

	User: User,
	content: string,
}

export interface ChatState {
	channels: RoomData[],
	rData: RoomData | null,
	state: {
		location: string,
		open: boolean,
	}
}

export interface ChatValue {

	content: ChatState,
	createChannel: (a: (a:Response)=>void)=>void,
	loaded: Map<string, boolean>,
	sendMessage: (message: string)=>void,
	setLocation: (location: string, id?: number | undefined)=>void,
	leaveChannel: (id: number, callback?: (data: any)=>(void))=>void
	deleteChannel: (id: number, callback?: (statusCode: number, statusText: string)=>(void))=>void,
	setOpen: (direction: boolean)=>void,
	chatLink: (location: string)=>void,
	openPrivateMessage: (userId: number)=>void
}

interface PayloadChatAction extends ChatState {
	
	roomId: number | null
	channel: any,
	message: MessageType,
	location: string,
	id: number,
	user: ConnectedUser,
	direction: boolean
}

export interface ChatAction {

	type: string,
	payload: Partial<PayloadChatAction>
}

export const ChatProvider = ( {children}: { children: JSX.Element} ) => {
	const initialeState: ChatState = {
		channels: [],
		rData: null,
		state: {
			location: '/home',
			open: false,
		}
	}
	const [chatValue, dispatch] = useReducer(chatReducer, initialeState)
	const {token, deleteToken, content: user} = useContext(UserContext) as UserContextValue
	const [loaded] = useState(new Map ([
		['channels', false],
	]))

	/* reducer */
	const setChannels = useCallback(
	(channels: RoomData[]) => {
		dispatch({type: "SET_CHANNELS", payload: {channels}
	});
	}, [dispatch])

	const addChannel = useCallback(
	(channel: RoomData) => {
		dispatch({type: "ADD_CHANNEL", payload: {channel}
	});
	}, [dispatch])

	const removeChannel = useCallback(
	(id: number) => {
		dispatch({type: "REMOVE_CHANNEL", payload: {id}})
	}, [dispatch])

	const addMessage = useCallback(
	(message: MessageType, roomId: number) => {
		dispatch({type: "ADD_MESSAGE", payload: {message, roomId}
	});
	}, [dispatch])

	const setLocation = useCallback(
		(location: string, id?: number | undefined) => {
			dispatch({type: "SET_LOCATION", payload: {location, id, user}
		});
	}, [dispatch, user])

	const setOpen = useCallback(
		(direction: boolean) => {
			dispatch({type: "SET_OPEN", payload: {direction}
		});
		}, [dispatch])
	/* end reducer */

	/* load all datas */
	
	useEffect(()=>{
		
		checkToken(token, 
		(token: string)=>fetchWithToken<any>({
			token,
		 	deleteToken,
			url: `/channels`, 
			callback: (data: any)=>{
				console.log(data)
				setChannels(data)
				loaded.set('channels', true)
			}
		}))
	}, [token, deleteToken])
	
	/* events */
	function openPrivateMessage(userId: number) {
		setOpen(true)
		setLocation('privateMessage', userId)
	}

	const createChannel = useCallback(
		function createChannelCallback(callback: (data: Response)=>void) {
			console.log('hey creating channel, please wait...')
			var name = 'nice room'
			var type = 'PUBLIC'
			var password = ''
			protectedFetch({
				token, deleteToken,
				url: `/channels`, method: 'POST',
				body: {name, type, password},
				onSuccess: (res: Response)=>{
					res.json().then(data=>{
						var nRoom: RoomData = {
							id: data.id,
							name: name,
							type: type,
							messages: [],
							ownerId: user.id,
							users: [{state: 'ADMIN',user: user}]
						}
						addChannel(nRoom)
						callback(res)
					})
				}
			})
		}
	, [token, deleteToken])
	
	const leaveChannel = useCallback(
	function leaveChannelCallback(id: number, callback?: (data: any)=>void) {
		console.log('leave channel...')
		protectedFetch({
			token, deleteToken,
			url: `/channels/${id}/leave`, method: 'DELETE',
			onSuccess: (res: Response)=>{
				if (callback)
					res.json().then((data: any)=>{callback(data)})
			}
		})
		checkToken(
			token,
			(token: string)=>{fetchWithToken<any>({
				token,
				deleteToken,
				url: `/channels/${id}/leave`,
				method: 'DELETE',
				callback: callback
			})}
		)
	}, [token, deleteToken])

	const deleteChannel = useCallback(
		function deleteChannelCallback(id: number,
		onSuccess?: (statusCode: number, message: string)=>void,
		onFail?: (err: any)=>void) {
			console.log('delete channel...')
			protectedFetch({
				token, deleteToken,
				url: `/channels/${id}`,
				method: 'DELETE',
				onSuccess: (res: Response)=>{
					if (res.status === 200)
						removeChannel(id)
					if (onSuccess) onSuccess(res.status, res.statusText)
				},
				onFail: onFail
			})
		}, [token, deleteToken, removeChannel])

	const navigate = useNavigate()
	function chatLink(location: string) {
		setOpen(false)
		navigate(`${location}`)
	}
	/* end events */

	/* sockets */
	const [ioChannels, setIoChannels] = useState<Socket<any, any> | null>(null)

	useEffect(()=>{

		if(!ioChannels)
			return
		console.log(ioChannels)
		
		ioChannels.on("connect", () => {
			console.info("Socket channels connected!")
			// console.log(ioChannels)
		});

		ioChannels.on("disconnect", () => {
			console.info("Socket auto disconnected")
			setIoChannels(null)
		});

		ioChannels.on('message', (info: any) => {
			console.log("message", info)
			if (!info.message && !info.User)
				return
			var message: MessageType = {
				content: info.message,
				User: info.user
			}
			addMessage(message, info.channel)
		})

		ioChannels.on('join', (info: any) => {
			console.log("join", info)
			// addMessage(info, info.channel)
		})

		ioChannels.on('leave', (info: any) => {
			console.log("leave", info)
			// addMessage(info, info.channel)
		})

		ioChannels.on('action', (info: any) => {
			console.log("action", info)
		})
	
		ioChannels.on('exception', (error: any) => {
			console.log(error)
		})

	}, [ioChannels, addMessage])
	

	useEffect(() => {
		if (!token)
			return
		const newIo = io("ws://localhost:3000/channels", {auth: { token }})
		setIoChannels(newIo)
		return () => {
			if (ioChannels)
			{
				ioChannels.disconnect()
				console.log('disconnect socket')
				setIoChannels(null)
			}
		}
	}, [token])
	
	const sendMessage = useCallback(
	function sendMessageCallback(message: string) {

		if (ioChannels && chatValue.rData) {
			var id: number = chatValue.rData.id
			ioChannels.emit("message", {
					channel: id,
					message: message
				}, (response: any) => {
					if (response === 'ok')
						addMessage({content: message, User: user}, id)
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
		leaveChannel: leaveChannel,
		deleteChannel: deleteChannel,
		setOpen: setOpen,
		chatLink: chatLink,
		openPrivateMessage: openPrivateMessage
	}
	return (
		<ChatContext.Provider value={value}>
			{children}
		</ChatContext.Provider>
	)
}