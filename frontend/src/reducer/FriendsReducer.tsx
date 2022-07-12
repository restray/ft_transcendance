import { ChatAction, ChatState, RoomData } from "../context/chatContext"
import { Friend, FriendsAction, FriendsState } from "../context/friendsContext"

export const friendsReducer = (state: FriendsState , action: FriendsAction) => {
	const {friends, userId, friend, status} = action.payload
	if (action.type === 'SET_FRIENDS') {
		if (friends)
			state.friends = friends
		console.log(state)
		return {...state}
	}
	if (action.type === 'DELETE_FRIEND') {
		if (userId)
			state.friends = state.friends.filter((friend: Friend)=>friend.user.id !== userId)
		return {...state}
	}
	if (action.type === 'ADD_FRIEND') {
		if (friend)
			state.friends.push(friend)
		return {...state}
	}
	if (action.type === 'UPDATE_FRIEND') {
		if (userId && status) {
			var find = state.friends.find((friend: Friend)=> friend.user.id === userId)
			if (find)
				find.state = status
		}
		return {...state}
	}
    return state
}