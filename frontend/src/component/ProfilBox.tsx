import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../context/chatContext';
import { BACKEND_HOSTNAME } from '../envir';
import useContextMenu from '../lib/generateMenu';

export function NameWithMenu({user, link}: {user: User, link?: (location: string)=>void}) {

	const generateMenu = useContextMenu([
		{
			name: 'View profile',
			func: function renamePage() {
				console.log(user.name);
			}
		},
		{
			name: 'Add to friends',
			func: function renamePage() {
				console.log('add ' + user.name + ' as friend');
			}
		},
		{
			name: 'Block user',
			func: function renamePage() {
				console.log('block ' + user.name);
			}
		}
	])
	let navigate = useNavigate();
	var [searchParams] = useSearchParams();
	
	function onClick(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation()
		searchParams.set('userId', String(user.id))

		if (link) {
			link(`/profile?${searchParams}`)
			return
		}
		navigate(`/profile?${searchParams}`)
	}

	return (
		<span
		className={'NameWithMenu'}
		onContextMenu={(e)=>generateMenu(e)}
		onClick={onClick}
		>
			{user.name}
		</span>
	)
}

export default function ProfilBox({link ,user, cName='ProfilBox', precClass=''}:
{  link?: (location: string)=>void, user: User, cName?: string, precClass?: string }) {
	return (
		<div className={`${cName} ${precClass}`}>
			<img src={`${BACKEND_HOSTNAME}/${user.avatar}`} alt='' className={`${cName}__image`} />
			<p className={`${cName}__name`}>
				<NameWithMenu link={link} user={user}/>
			</p>
		</div>
	)
}
