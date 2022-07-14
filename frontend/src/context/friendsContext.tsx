import React, {createContext, useReducer, useCallback, useState, useEffect, useContext} from 'react';
import { protectedFetch } from '../lib/fetchImprove';
import { friendsReducer } from '../reducer/FriendsReducer';
import { MessageType, User } from './chatContext';
import { UserContext, UserContextValue } from './userContext';
export const FriendsContext = createContext<FriendsContextValue | null>(null);

export interface FriendsState {
	friends: Friend[]
}
export interface Friend {
	user: User,
	status: FriendState,
	state: FriendStatus,
	message: MessageType[]
}

export interface FriendsContextValue {
	state: FriendsState,
	addFriend: (user: User, onSuccess?: (res: Response)=>void)=>void,
	blockUser: (user: User, onSuccess?: (res: Response)=>void)=>void,
	acceptFriend: (userId: number, onSuccess?: (res: Response)=>void)=>void,
	removeLink: (userId: number, onSuccess?: (res: Response)=>void)=>void,
	getFriendLink: (userId: number)=>FriendStatus | null,
	//send pm
}

export type FriendStatus = 'WAITING' | 'SEND_WAITING' | 'BLOCKED' | 'ACCEPTED' | 'BLOCKED_BY'
export type FriendState = 'ONLINE' | 'OFFLINE' | 'PLAYING'

export interface FriendsActionPayload extends Partial<FriendsState>{
	userId: number,
	friend: Friend,
	status: FriendStatus
}

export interface FriendsAction {
	type: string,
	payload: Partial<FriendsActionPayload>
}


export const FriendsContextProvider = ( {children}: { children: JSX.Element} ) => {
	const initialeState: FriendsState = {
		friends: []
	}
	const [friendsValue, dispatch] = useReducer(friendsReducer, initialeState)
	const {token, deleteToken, content: user} = useContext(UserContext) as UserContextValue

	/* reducer */
	const setFriends = useCallback(
	(friends: Friend[]) => {
		dispatch({type: "SET_FRIENDS", payload: {friends}
	});
	}, [dispatch])

	const deleteFriend = useCallback(
	(userId: number) => {
		dispatch({type: "DELETE_FRIEND", payload: {userId}
	});
	}, [dispatch])

	const addFriendReducer = useCallback(
	(friend: Friend) => {
		dispatch({type: "ADD_FRIEND", payload: {friend}
	});
	}, [dispatch])

	const updateFriend = useCallback(
		(userId: number, status: FriendStatus) => {
			dispatch({type: "UPDATE_FRIEND", payload: {userId, status}
		});
		}, [dispatch])

	//update status
	//add pm
	//update receive/ unreceive/ friend leave friend request
	/* end reducer */

	/* start dl */
	useEffect(()=>{

		protectedFetch({
			token, deleteToken,
			url: '/friends', method: 'GET',
			onSuccess: (res: Response)=>{
				res.json().then((data: any)=>{
					console.log(data)
					var allFriends: Friend[] = []
					data.forEach((friend: any)=>{
						var nFriend: Friend | null = null
						if (friend.receiver.id === user.id) {
							nFriend = {
								user: {
									id: friend.requester.id,
									name: friend.requester.name,
									avatar: friend.requester.avatar
								},
								state: friend.status,
								message: [], //friend.requester.messages
								status: friend.requester.status
							}
							if (nFriend.state === "BLOCKED")
								nFriend.state = 'BLOCKED_BY'
						}
						else { //user is the receiver!
							nFriend = {
								user: {
									id: friend.receiver.id,
									name: friend.receiver.name,
									avatar: friend.receiver.avatar
								},
								state: friend.status,
								message: [], //friend.receiver.messages
								status: friend.receiver.status
							}
							if (nFriend.state === "WAITING")
								nFriend.state = "SEND_WAITING"
						}
						allFriends.push(nFriend)
					})
					setFriends(allFriends)
				})
			}
		})
	}, [token, setFriends, deleteToken, user.id])
	/* end dl */

	/* start actions */
	function addFriend(user: User, onSuccess?: (res: Response)=>void) {
		protectedFetch({
			token, deleteToken,
			url: `/friends/${user.id}`, method: 'POST',
			onSuccess: (res: Response)=>{
				if (res.status === 201) {
					var nFriend: Friend = {user: user, state: 'SEND_WAITING', message: [], status: 'OFFLINE'}
					addFriendReducer(nFriend)
				}
				if (onSuccess) onSuccess(res)
			}
		})
	}
	function blockUser(user: User, onSuccess?: (res: Response)=>void) {
		protectedFetch({
			token, deleteToken,
			url: `/friends/${user.id}/block`, method: 'DELETE',
			onSuccess: (res: Response)=>{
				if (res.status === 200) {
					var nFriend: Friend = {user: user, state: 'BLOCKED', message: [], status: 'OFFLINE'}
					addFriendReducer(nFriend)
				}
				if (onSuccess) onSuccess(res)
			}
		})
	}
	function acceptFriend(userId: number, onSuccess?: (res: Response)=>void) {
		protectedFetch({
			token, deleteToken,
			url: `/friends/${userId}/accept`, method: 'POST',
			onSuccess: (res: Response)=>{
				if (res.status === 201) { //@WARNING 201 must be 200
					updateFriend(userId, 'ACCEPTED')
				}
				if (onSuccess) onSuccess(res)
			}
		})
	}
	function removeLink(userId: number, onSuccess?: (res: Response)=>void) {
		protectedFetch({
			token, deleteToken,
			url: `/friends/${userId}`, method: 'DELETE',
			onSuccess: (res: Response)=>{
				if (res.status === 200) {
					deleteFriend(userId)
				}
				if (onSuccess) onSuccess(res)
			}
		})
	}
	/* end actions */
	function getFriendLink(userId: number): FriendStatus | null {
		var finded = friendsValue.friends.find((friend: Friend)=> friend.user.id === userId)
		if (finded === undefined)
			return null
		return finded.state
	}

	const value: FriendsContextValue = {
		state: friendsValue,
		addFriend,
		blockUser,
		acceptFriend,
		removeLink,
		getFriendLink
	}
	return (
		<FriendsContext.Provider value={value}>
			{children}
		</FriendsContext.Provider>
	)
}

// if (action.type === 'SET_FRIENDS') {
// 	if (action.payload.friends)
// 		state.friends = action.payload.friends
// 	return {...state}
// }