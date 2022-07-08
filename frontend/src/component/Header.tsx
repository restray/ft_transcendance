import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sanitizeQuery } from '../lib/queryString';

export default function Header() {

	let navigate = useNavigate();

	var [searchParams, setSearchParams] = useSearchParams()

	function onClick() {
		navigate(`/?${sanitizeQuery(searchParams).toString()}`)
	}

	return (
		<div 
		onClick={onClick}
		className='header'
		>
			CLASSICAL PONG
		</div>
	)
}
