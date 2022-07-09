import { ChatAction, ChatState, RoomData } from "../context/chatContext"

export const chatReducer = (state: ChatState , action: ChatAction ) => {
    if (action.type === 'SET_FRIENDS') {
		if (action.payload.friends)
        	state.friends = action.payload.friends
		return {...state}
    }
	else if (action.type === 'SET_CHANNELS') {
		if (action.payload.channels)
			state.channels = action.payload.channels
		return {...state}
	}
	else if (action.type === 'ADD_CHANNEL') {
		if (action.payload.channel)
			state.channels.push(action.payload.channel)
		return {...state}
	}
	else if (action.type === 'DELETE_CHANNEL') {
		if (action.payload.id)
		{
			console.log(action.payload.id)
			state.channels = state.channels.filter((channel: RoomData)=>
				channel.id !== action.payload.id)
		}
		return {...state}
	}
	else if (action.type === 'ADD_MESSAGE') {
		if (action.payload.roomId && action.payload.message)
		{
			var r = state.channels.find(room=> room.id === action.payload.roomId)
		}
		return {...state}
	}
	// else if (action.type === 'SET_ROOM_DATA') {
	// 	if ( action.payload.roomId )
	// 		return {...setRoomData(state, action.payload.roomId)}
	// 	state.rData = null
	// 	return {...state}
	// }
	else if (action.type === 'SET_LOCATION') {
		////////////////////location
		var location = action.payload.location
		var id = action.payload.id
		var user = action.payload.user
		if (location === 'home')
		{
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
		////////////////////location
		return {...state}
	}
    return state
}

function setRoomData(state: ChatState, id: number): ChatState {
	var finded: RoomData | undefined = state.channels.find(room=> room.id === id)
	if (finded)
		state.rData = finded
	return {...state}
}