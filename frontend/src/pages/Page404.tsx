import React, {useEffect, useRef, useState} from 'react'
import BigButton from '../component/BigButton'
import Game from '../component/Game'
import ProfilBox from '../component/ProfilBox'


export default function Home({ message }: { message: string }) {
	return (
		<div className={'Page404'}>
			<h1>ERROR - 404</h1>
			<p>{message}</p>
		</div>
	)
}