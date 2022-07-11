import { useContext, useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import MatchMakingButton from "../../component/MatchMakingBox";
import { NameWithMenu } from "../../component/ProfilBox";
import { ChatContext, ChatValue, MessageType } from "../../context/chatContext";
import { UserContext, UserContextValue } from "../../context/userContext";
import game from '../../images/game.svg'
import send from '../../images/send.svg'

function Message({ content, user, direction='left' }: { content: string, user: string, direction?: string }) {

	if (direction === 'right')
	{
		return (
			<div className='Message Message__right'>
				<div className='Message__data'>
					<p className='Message__name Message__right__name'>
						<span className='Message__date Message__right__date'>11:52</span>
						{/* <NameWithMenu name={user} /> */}
					</p>
					<div className='Message__content Message__right__content'>{content}</div>
				</div>
				<div className='Message__image Message__right__image'></div>
			</div>
		)
	}
	return (
		<div className='Message'>
			<div className='Message__image Message__left__image'></div>
			<div className='Message__data'>
				<p className='Message__name'>
					{/* <NameWithMenu name={user} /> */}
					<span className='Message__date Message__left__date'>11:52</span>
				</p>
				<div className='Message__content Message__left__content'>{content}</div>
			</div>
		</div>
	)
}

function MessageSystem({user, content}: {user: string, content: string}) {

	return (
		<div className='MessageSystem'>
			{/* <NameWithMenu name={user} /> */}
			<span style={{whiteSpace: 'pre'}}>{` ${content}`}</span>
		</div>
	)
}

function MessageGame({user}: {user: string}) {

	return (
		<div className='MessageGame'>
			<div className='MessageGame__content' style={{whiteSpace: 'pre'}}>
				<div  className='MessageGame__content__text'>{`${user} want to play!`}</div>
				<button className='inlineButton'>Join</button>
			</div>
		</div>
	)
}

export default function ChatUi() {

	const ref = useRef<any>()
	const [value, setValue] = useState<string>('')
	const {content: {rData}, sendMessage} = useContext(ChatContext) as ChatValue
	const {content: {id}} = useContext(UserContext) as UserContextValue

	function focus() {
		if(ref.current) ref.current.focus(); 
	}
	function onClickSendMessage(e: React.MouseEvent<HTMLDivElement>) {
		e.stopPropagation()
		if (value.length === 0)
		{
			console.log('empty message!')
			return
		}
		sendMessage(value)
		setValue('')
	}
	// console.log(rData)
	return (
		<div className='ChatUi'>
			<div className='ChatUi__message'>
				<div className='ChatUi__message__container'>
					{rData && rData.messages.slice(0).reverse().map((msg: MessageType, index: number)=>{
						if (msg.User.id === id)
							return <Message direction={'right'} content={msg.content} user={msg.User.name} key={index}/>
						return <Message content={msg.content} user={msg.User.name} key={index}/>
					})
					}
				</div>
			</div>
			<div className='ChatUi__input' onClick={focus}>
				<ReactTextareaAutosize
				ref={ref}
				onChange={ev => setValue(ev.target.value)}
				value={value}
				/>
				<MatchMakingButton>
					<img className='ChatUi__input__button' src={game} alt={'game'}/>
				</MatchMakingButton>
				<img className='ChatUi__input__button' src={send} alt={'send'} onClick={onClickSendMessage}/>
			</div>
		</div>
	)
}