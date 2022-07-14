import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChatContext, ChatValue, User } from '../context/chatContext';
import { Tool } from '../context/rightClickMenu';
import { UserContext, UserContextValue } from '../context/userContext';
import { useProfileTools, useRoomProfilTools } from '../context/userMenu';
import { BACKEND_HOSTNAME } from '../envir';
import useContextMenu from '../lib/generateMenu';

export function NameWithMenu({user, link, tools = [], color = 'black'}:
{user: User, link?: (location: string, qParams?: string)=>void, tools?: any[], color?: string}) {
	
	const {content: cUser} = useContext(UserContext) as UserContextValue
	let navigate = useNavigate()

	const generateMenu = useContextMenu([...useProfileTools(user, cUser), ...tools])
	var [searchParams] = useSearchParams();
	
	function onClick(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation()
		searchParams.set('userId', String(user.id))

		if (link) {
			link(`/profile`, `userId=${user.id}`)
			return
		}
		navigate(`/profile?${searchParams}`)
	}

	return (
		<span
		className={'NameWithMenu'}
		onContextMenu={(e)=>generateMenu(e)}
		onClick={onClick}
		style={{color}}
		>
			{user.name}
		</span>
	)
}

export default function ProfilBox({link ,user, cName='ProfilBox', precClass='', color = 'black'}:
{  link?: (location: string)=>void, user: User, cName?: string, precClass?: string, color?: string }) {
	return (
		<div className={`${cName} ${precClass}`}>
			<img src={`${BACKEND_HOSTNAME}/${user.avatar}`} alt='' className={`${cName}__image`} />
			<p className={`${cName}__name`}>
				<NameWithMenu color={color} link={link} user={user} tools={useRoomProfilTools(user)}/>
			</p>
		</div>
	)
}
