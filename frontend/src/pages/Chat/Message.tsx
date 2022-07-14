import React, { useContext, useEffect, useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import MatchMakingButton from "../../component/MatchMakingBox";
import { NameWithMenu } from "../../component/ProfilBox";
import { ChatContext, ChatValue, MessageType, User } from "../../context/chatContext";
import { FriendsContext, FriendsContextValue, FriendStatus } from "../../context/friendsContext";
import { UserContext, UserContextValue } from "../../context/userContext";
import { useRoomProfilTools } from "../../context/userMenu";
import { BACKEND_HOSTNAME } from "../../envir";
import game from '../../images/game.svg'
import send from '../../images/send.svg'

function Message({ content, user, direction='left' }: { content: string, user: User, direction?: string }) {
	
	const {chatLink, getGradeColor} = useContext(ChatContext) as ChatValue
	const {getFriendLink} = useContext(FriendsContext) as FriendsContextValue
	const tools = useRoomProfilTools(user)

	var gradeColor = getGradeColor(user.id)
	var friendStatus = getFriendLink(user.id)
	if (direction === 'right')
	{
		return (
			<div className='Message Message__right'>
				<div className='Message__data'>
					<p className='Message__name Message__right__name'>
						<span className='Message__date Message__right__date'>11:52</span>
						<NameWithMenu user={user} link={chatLink} tools={tools} color={gradeColor}/>
					</p>
					<div className='Message__content Message__right__content'>{content}</div>
				</div>
			<img src={`${BACKEND_HOSTNAME}/${user.avatar}`} alt=''className='Message__image Message__right__image' />
			</div>
		)
	}
	return (
		<div className='Message'>
			<img src={`${BACKEND_HOSTNAME}/${user.avatar}`} alt='' className='Message__image Message__left__image' />
			<div className='Message__data'>
				<p className='Message__name'>
					<NameWithMenu user={user} link={chatLink} tools={tools} color={gradeColor}/>
					<span className='Message__date Message__left__date'>11:52</span>
				</p>
				{friendStatus === 'BLOCKED' ?
				<div className='Message__content Message__left__content Message__content--blocked'>
					This is user is blocked
				</div>
				:
				<div className='Message__content Message__left__content'>{content}</div>
			}
				
			</div>
		</div>
	)
}

// function MessageSystem({user, content}: {user: string, content: string}) {

// 	const {chatLink} = useContext(ChatContext) as ChatValue
// 	const tools = useRoomProfilTools(user)
// 	return (
// 		<div className='MessageSystem'>
// 			<NameWithMenu name={user} link={chatLink} tools={tools}/>
// 			<span style={{whiteSpace: 'pre'}}>{` ${content}`}</span>
// 		</div>
// 	)
// }

// function MessageGame({user}: {user: string}) {

// 	const {chatLink} = useContext(ChatContext) as ChatValue
// 	const tools = useRoomProfilTools(user)
// 	return (
// 		<div className='MessageGame'>
// 			<div className='MessageGame__content' style={{whiteSpace: 'pre'}}>
// 				<NameWithMenu name={user} link={chatLink} tools={tools}/>
// 				{/* <div  className='MessageGame__content__text'>{`${user} want to play!`}</div> */}
// 				<button className='inlineButton'>Join</button>
// 			</div>
// 		</div>
// 	)
// }

export default function ChatUi() {

	const ref = useRef<any>()
	const [value, setValue] = useState<string>('')
	const {content: {rData}, sendMessage, getGradeUser} = useContext(ChatContext) as ChatValue
	const {content: {id}} = useContext(UserContext) as UserContextValue
	const [gradeUser, setGradeUser] = useState('')

	useEffect(()=>{
		var grade = getGradeUser(id)
		if (grade)
		{
			if (grade === 'MUTE')
				setValue('You are muted')
			setGradeUser(grade)
		}
	}, [getGradeUser, id])
	
	function focus() {
		if(ref.current) ref.current.focus(); 
	}
	function onClickSendMessage(e: React.MouseEvent<HTMLDivElement>) {
		e.stopPropagation()
		sendMessageEvent()
	}
	function sendMessageEvent() {
		if (gradeUser === 'MUTE')
			return
		if (value.length === 0)
		{
			console.log('empty message!')
			return
		}
		sendMessage(value)
		setValue('')
	}
	function enterSendMessage(e: React.KeyboardEvent<HTMLDivElement>) {
		e.stopPropagation()
		if (e.key === 'Enter')
		{		
			e.preventDefault()
			sendMessageEvent()
		}
	}
	function writeMsg(ev: any) {
		if (gradeUser === 'MUTE')
			setValue('You are muted')
		else
			setValue(ev.target.value)
	}

	return (
		<div className='ChatUi'>
			<div className='ChatUi__message'>
				<div className='ChatUi__message__container'>
					{rData && rData.messages.map((msg: MessageType, index: number)=>{
						if (msg.User.id === id)
							return <Message direction={'right'} content={msg.content} user={msg.User} key={index}/>
						return <Message content={msg.content} user={msg.User} key={index}/>
					})
					}
				</div>
			</div>
			<div className={`ChatUi__input ${gradeUser === 'MUTE' && 'ChatUi__input--muted'}`}
			onClick={focus} onKeyDown={enterSendMessage}>
				<ReactTextareaAutosize
				ref={ref}
				onChange={writeMsg}
				value={value}
				tabIndex={gradeUser === 'MUTE' ? -1 : 0}
				/>
				<MatchMakingButton>
					<img className='ChatUi__input__button' src={game} alt={'game'}/>
				</MatchMakingButton>
				<img className='ChatUi__input__button' src={send} alt={'send'} onClick={onClickSendMessage}/>
			</div>
		</div>
	)
}