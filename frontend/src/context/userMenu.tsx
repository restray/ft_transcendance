import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext, ChatValue, ConnectedUser, RoomData, User } from "./chatContext";
import { FriendsContext, FriendsContextValue, FriendStatus } from "./friendsContext";
import { Tool } from "./rightClickMenu";
import { UserContext, UserContextValue } from "./userContext";

export function useProfileTools(user: User, cUser: User) {

	var tools: Tool[] = []
	const {acceptFriend, removeLink, getFriendLink, addFriend, blockUser} = useContext(FriendsContext) as FriendsContextValue
	const {openPrivateMessage, chatLink: navigate} = useContext(ChatContext) as ChatValue
	
	var link: FriendStatus | null = getFriendLink(user.id)
	if (link === 'BLOCKED_BY') {
		return tools
	}
	tools.push({
		name: 'View profile',
		func: function goProfile() {
			navigate(`/profile?userId=${user.id}`)
		}
	})
	
	if (cUser.id === user.id) {
		tools.push({
			name: 'Settings',
			func: function goSettings() {
				navigate(`/settings`)
			}
		})
	}
	else if (link === 'WAITING') {
		tools.push({
			name: 'Accept friend invitation',
			func: function addFriendTool() {
				acceptFriend(user.id)
			}
		})
		tools.push({
			name: 'Refuse friend invitation',
			func: function addFriendTool() {
				removeLink(user.id)
			}
		})
	}
	else if (link === 'SEND_WAITING') {
		tools.push({
			name: 'Cancel friend invitation',
			func: function sendWaiting() {
				removeLink(user.id)
			}
		})
	}
	else if (link === 'BLOCKED') {
		tools.push({
			name: 'Unblock',
			func: function blocked() {
				removeLink(user.id)
			}
		})
	}
	else if (link === 'ACCEPTED') {
		tools.push({
			name: 'Send message',
			func: function sendpm() {
				openPrivateMessage(user.id)
			}
		})
		tools.push({
			name: 'Remove friend',
			func: function removeFriend() {
				removeLink(user.id)
			}
		})
	}
	else {
		tools.push({
			name: 'Add to friends',
			func: function add() {
				addFriend(user)
			}
		})
		tools.push({
			name: 'Block this user',
			func: function block() {
				blockUser(user)
			}
		})
	}

	return tools
}

export function useRoomProfilTools(user: User) {
	var tools: Tool[] = []
	const {} = useContext(FriendsContext) as FriendsContextValue
	const {content: cUser} = useContext(UserContext) as UserContextValue
	const {content: {rData}, getGradeUser, promoteUser, banUser, muteUser} = useContext(ChatContext) as ChatValue

	if (!rData)
		return
	if (cUser.id === user.id) {
		return tools
	}
	var userGrade = getGradeUser(user.id)
	if (!userGrade)
		return
	console.log(userGrade)
	/* functions */
	function promote() {
		promoteUser(user.id, true)
	}
	function demote() {
		promoteUser(user.id, false)
	}
	function ban() {
		banUser(user.id, true)
	}
	function unban() {
		banUser(user.id, false)
	}
	function mute() {
		muteUser(user.id, true)
	}
	function unmute() {
		muteUser(user.id, false)
	}

	if (cUser.id === rData.ownerId) {
		if (userGrade === 'ADMIN') {
			tools.push({name: 'Demote', func: demote})
		}
		else if (userGrade === 'USER') {
			tools.push({name: 'Promote', func: promote})
		}
		else if (userGrade === 'MUTE') {
			tools.push({name: 'Unmute', func: unmute})
		}
		else if (userGrade === 'BAN') {
			tools.push({name: 'Unban', func: unban})
		}
		if (userGrade !== 'BAN' && userGrade !== 'MUTE')
			tools.push({name: 'Mute for 12 hours', func: mute})
		if (userGrade !== 'BAN')
			tools.push({name: 'Ban', func: ban})
	}
	return tools
}