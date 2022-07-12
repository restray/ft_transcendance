import React, {createContext, useReducer, useCallback, useState, useEffect, useContext} from 'react';
import { protectedFetch } from '../lib/fetchImprove';
import { friendsReducer } from '../reducer/FriendsReducer';
import { User } from './chatContext';
import { UserContext, UserContextValue } from './userContext';
export const FriendsContext = createContext<FriendsContextValue | null>(null);

export interface FriendsState {
	friends: Friend[]
}
export interface Friend {
	user: User,
	state: string
}

export interface FriendsContextValue {
	state: FriendsState,
	addFriend: (user: User, onSuccess?: (res: Response)=>void)=>void,
	blockUser: (user: User, onSuccess?: (res: Response)=>void)=>void,
	acceptFriend: (userId: number, onSuccess?: (res: Response)=>void)=>void,
	removeLink: (userId: number, onSuccess?: (res: Response)=>void)=>void,
}

export type FriendStatus = 'WAITING' | 'SEND_WAITING' | 'BLOCKED' | 'ACCEPTED'

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
	/* end reducer */

	/* start dl */
	useEffect(()=>{

		protectedFetch({
			token, deleteToken,
			url: '/friends', method: 'GET',
			onSuccess: (res: Response)=>{
				res.json().then((data: any)=>{
					var allFriends: Friend[] = []
					data.forEach((friend: any)=>{
						var nFriend: Friend | null = null
						if (friend.receiver.id !== user.id) {
							nFriend = {
								user: {id: friend.receiver.id, name: friend.receiver.name, avatar: friend.receiver.avatar},
								state: friend.status
							}
						}
						else { //user is the receiver!
							nFriend = {
								user: {
									id: friend.requester.id,
									name: friend.requester.name,
									avatar: friend.requester.avatar
								},
								state: friend.status
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
			url: `/friends/${user.id}`, method: 'WAITING',
			onSuccess: (res: Response)=>{
				if (res.status === 201) {
					var nFriend: Friend = {user: user, state: 'WAITING'}
					addFriendReducer(nFriend)
				}
				if (onSuccess) onSuccess(res)
			}
		})
	}
	function blockUser(user: User, onSuccess?: (res: Response)=>void) {
		protectedFetch({
			token, deleteToken,
			url: `/friends/${user.id}/block`, method: 'POST',
			onSuccess: (res: Response)=>{
				if (res.status === 200) {
					var nFriend: Friend = {user: user, state: 'BLOCKED'}
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
				if (res.status === 200) {
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

	const value: FriendsContextValue = {
		state: friendsValue,
		addFriend,
		blockUser,
		acceptFriend,
		removeLink
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