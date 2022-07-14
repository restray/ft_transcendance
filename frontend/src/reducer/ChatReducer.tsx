import { ChatAction, ChatState, RoomData, RoomUser } from "../context/chatContext"

export const chatReducer = (state: ChatState , action: ChatAction ) => {
	const {location, id, user, grade, direction} = action.payload
	if (action.type === 'SET_CHANNELS') {
		if (action.payload.channels)
			state.channels = action.payload.channels
		return {...state}
	}
	else if (action.type === 'ADD_CHANNEL') {
		if (action.payload.channel)
			state.channels.push(action.payload.channel)
		return {...state}
	}
	else if (action.type === 'REMOVE_CHANNEL') {
		if (id)
		{
			state.channels = state.channels.filter((channel: RoomData)=>
				channel.id !== action.payload.id)
			state = {...setRoomData(state, id)}
		}
		return {...state}
	}
	else if (action.type === 'ADD_MESSAGE') {
		if (action.payload.roomId && action.payload.message)
		{
			var r = state.channels.find(room=> room.id === action.payload.roomId)
			if (r)
				r.messages = [action.payload.message, ...r.messages]
			console.log(r)
		}
		return {...state}
	}
	else if (action.type === 'SET_LOCATION') {
		////////////////////location
		state.state.open = true
		if (location === 'home') {
			state.state.location = 'home'
			state.rData = null
		}
		else if (location === 'room/home' && id) {
			state.state.location = 'room/home'
			state = {...setRoomData(state, id)}
		}
		else if (location === 'room/settings' && id && user) {
			var find = state.channels.find((roomData: RoomData)=> roomData.id === id)
			
			if (find && find.ownerId === user.id) {
				state.state.location = 'room/settings'
				state = {...setRoomData(state, id)}
			}
		}
		else if (location === 'privateMessage' && id) {
			state.state.location = 'privateMessage'
			state.rData = null
		}
		else if (location === 'joinRoom' && id) {
			state = {...setRoomData(state, id)}
			if (state.rData)
				state.state.location = 'room/join'
		}
		////////////////////location
		return {...state}
	}
	else if (action.type === 'SET_OPEN') {
		if (typeof(action.payload.direction) === 'boolean') {
			state.state.open = action.payload.direction
		}
		return {...state}
	}
	else if (action.type === 'PROMOTE_USER' && id && grade) {
		var promotedUser = state.rData?.users.find((user: RoomUser)=> user.user.id === id)
		if (promotedUser)
			promotedUser.state = grade
		return {...state}
	}
	else if (action.type === 'MUTE_USER' && id && direction !== undefined) {
		var promotedUser = state.rData?.users.find((user: RoomUser)=> user.user.id === id)
		if (promotedUser)
			promotedUser.state = direction ? 'MUTE' : 'USER'
		return {...state}
	}
	else if (action.type === 'BAN_USER' && id && direction !== undefined) {
		var promotedUser = state.rData?.users.find((user: RoomUser)=> user.user.id === id)
		if (promotedUser)
			promotedUser.state = direction ? 'BAN' : 'USER'
		console.log(promotedUser)
		return {...state}
	}
    return state
}

function setRoomData(state: ChatState, id: number): ChatState {
	var finded: RoomData | undefined = state.channels.find(room=> room.id === id)
	if (finded)
		state.rData = finded
	else
	{
		state.state.location = 'home'
		state.rData = null
	}
	return {...state}
}