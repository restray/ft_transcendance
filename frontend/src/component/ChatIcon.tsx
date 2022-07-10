import React, { useContext, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import Logo from '../images/talk.svg'
import Send from '../images/whiteSend.svg'
import Home from '../images/whiteHome.svg';
import Chat from '../pages/Chat/Chat';
import { useNavigate, useSearchParams } from 'react-router-dom'
import Modal, { useModal } from './Modal';
import { homeSanitizeQuery, sanitizeQuery } from '../lib/queryString';
import { UserContext, UserContextValue } from '../context/userContext';
import { ChatContext, ChatProvider, ChatValue } from '../context/chatContext';

export default function ChatIcon({ constraintsRef }:
{ constraintsRef: React.MutableRefObject<null> }) {

	return (
		<ChatIconWrapped constraintsRef={constraintsRef}/>
	)
}

function ChatIconWrapped({ constraintsRef } :
{ constraintsRef: React.MutableRefObject<null> }) {

    const {content} = useContext(UserContext) as UserContextValue
    const {content: {state: {open}}, setOpen} = useContext(ChatContext) as ChatValue

	function openChat() {
		setOpen(true)
	}
	let navigate = useNavigate()
	function goHome() {
		navigate(`/`)
	}
	function goProfile() {
		navigate(`/profile?name=${content.name}`)
	}
	return (
		<>
			<motion.img
			className='chatIcon'
			whileHover={{ scale: 1.2 }}
			drag
			dragConstraints={constraintsRef}
			dragMomentum={false}
			src={Logo} alt='logo'
			onClick={openChat}
			>
			</motion.img>
			<div className='chatBox'>
				<img src={Send} alt='' onClick={openChat}/>
				<img src={Home} alt='' onClick={goHome}/>
				<img src={Home} alt='' onClick={goProfile}/>
			</div>
			<Modal open={open} setOpen={setOpen}><Chat /></Modal>
		</>
	)
}