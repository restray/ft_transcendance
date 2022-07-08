import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import Logo from '../images/talk.svg'
import Send from '../images/whiteSend.svg'
import Home from '../images/whiteHome.svg';
import Chat from '../pages/Chat/Chat';
import { useNavigate, useSearchParams } from 'react-router-dom'
import Modal, { useModal } from './Modal';
import { homeSanitizeQuery, sanitizeQuery } from '../lib/queryString';

export default function ChatIcon({ constraintsRef } :
{ constraintsRef: React.MutableRefObject<null> }) {

	const [open, setOpen] = useState<boolean>(false)


	var [searchParams, setSearchParams] = useSearchParams();
	function setOpenEvent() {
		searchParams.delete('chat')
		setSearchParams(searchParams, {replace: true})
	}

	useEffect(() => {
		if (searchParams.get('chat') === 'open')
			setOpen(true)
		else
		{
			searchParams.delete('get')
			setOpen(false)
		}
		setSearchParams(searchParams, {replace: true})
	}, [searchParams])
	
	function onClick() {
		searchParams.set('chat', 'open')
		setSearchParams(searchParams, {replace: true})
	}
	let navigate = useNavigate()
	function goHome() {
		navigate(`/?${homeSanitizeQuery(searchParams).toString()}`)
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
			onClick={onClick}
			>
			</motion.img>
			<div className='chatBox'>
				<img src={Send} alt='' onClick={onClick}/>
				<img src={Home} alt='' onClick={goHome}/>
				<img src={Home} alt='' onClick={goHome}/>
			</div>
			<Modal open={open} setOpen={setOpenEvent}><Chat /></Modal>
		</>
	)
}