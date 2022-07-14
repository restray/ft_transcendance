import { AnimatePresence } from "framer-motion"
import { useContext, useEffect, useState } from "react"
import ProfilBox from "../../component/ProfilBox"
import { ChatContext, ChatValue, RoomData } from "../../context/chatContext"
import { getWindowDimensions } from "./Chat"
import { motion } from 'framer-motion'
import arrow from '../../images/arrow.svg'

function RoomUsersSection({rData, chatLink, gradeName, gradeTitle}:
{rData: RoomData, chatLink: (loc: string)=>void, gradeName: string, gradeTitle: string}) {
	const {getGradeColor} = useContext(ChatContext) as ChatValue
	
	return (

		<div className='RoomUsers__section'>
			<div className='RoomUsers__section__name'>
				{gradeTitle} -
			</div>
			{rData.users.map((user: any)=>{
				if (user.state === gradeName && rData.ownerId !== user.user.id)
					return <ProfilBox link={chatLink} key={user.user.id}
					user={user.user} cName={'RoomUsers__section__profile'}
					color={getGradeColor(user.user.id)}/>
				return null
			})}
		</div>
	)
}

export function RoomUsers() {

	const [windowDimensions] = useState(getWindowDimensions())
	const [open, setOpen] = useState<boolean>(false)
	const {chatLink, content: {rData}, getGradeColor} = useContext(ChatContext) as ChatValue

	useEffect(()=>{
		if (windowDimensions.width > 700)
			setOpen(true)
	}, [windowDimensions])
	function onClick() {
		setOpen(!open)
	}
	return (
		rData &&
		<div className='RoomUsers--container'>
			{windowDimensions.width <= 700 && <div className='RoomUsers__openButton' onClick={onClick}>
					{open ? <img src={arrow} alt='' style={{transform: 'rotate(180deg)'}}/>
					: <img src={arrow} alt='' /> }
				</div>
			}
			<AnimatePresence>
			{open &&
				<motion.div
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				exit={{ scaleX: 0 }}
				style={{ transformOrigin: 'center right' }}
				className='RoomUsers'>
					<div className='RoomUsers__section'>
						<div className='RoomUsers__section__name'>
							Owner -
						</div>
						{rData.users.map((user: any)=>{
							if (rData.ownerId === user.user.id)
								return <ProfilBox link={chatLink} key={user.user.id} user={user.user} cName={'RoomUsers__section__profile'}
								color={getGradeColor(user.user.id)}/>
							return null
						})}
					</div>
					
					<RoomUsersSection rData={rData} chatLink={chatLink} gradeName={'ADMIN'} gradeTitle={'Admin'}/>
					<RoomUsersSection rData={rData} chatLink={chatLink} gradeName={'USER'} gradeTitle={'User'}/>
					<RoomUsersSection rData={rData} chatLink={chatLink} gradeName={'MUTE'} gradeTitle={'Muted'}/>
					<RoomUsersSection rData={rData} chatLink={chatLink} gradeName={'BAN'} gradeTitle={'Banned'}/>
			</motion.div>
			}
			</AnimatePresence>
		</div>
	)
}