import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../context/chatContext';
import useContextMenu from '../lib/generateMenu';

export function NameWithMenu({user}: {user: User}) {

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

export default function ProfilBox({user, cName='ProfilBox', precClass=''}:
{ user: User, cName?: string, precClass?: string }) {
	return (
		<div className={`${cName} ${precClass}`}>
			<div className={`${cName}__image`}></div>
			<p className={`${cName}__name`}>
				<NameWithMenu user={user}/>
			</p>
		</div>
	)
}
