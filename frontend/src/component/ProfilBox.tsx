import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useContextMenu from '../lib/generateMenu';

export function NameWithMenu({ name }: { name: string }) {

	const generateMenu = useContextMenu([
		{
			name: 'View profile',
			func: function renamePage() {
				console.log(name);
			}
		},
		{
			name: 'Add to friends',
			func: function renamePage() {
				console.log('add ' + name + ' as friend');
			}
		},
		{
			name: 'Block user',
			func: function renamePage() {
				console.log('block ' + name);
			}
		}
	])
	let navigate = useNavigate();
	var [searchParams, setSearchParams] = useSearchParams();
	
	function onClick(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation()
		searchParams.set('name', name)
		searchParams.delete('chat')
		navigate(`/profile?${searchParams}`)
	}

	return (
		<span
		className={'NameWithMenu'}
		onContextMenu={(e)=>generateMenu(e)}
		onClick={onClick}
		>
			{name}
		</span>
	)
}

export default function ProfilBox({ name, cName='ProfilBox', precClass='' }:
{ name: string, cName?: string, precClass?: string }) {
	return (
		<div className={`${cName} ${precClass}`}>
			<div className={`${cName}__image`}></div>
			<p className={`${cName}__name`}>
				<NameWithMenu name={name}/>
			</p>
		</div>
	)
}
