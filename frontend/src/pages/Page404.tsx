import React, {useEffect, useRef, useState} from 'react'
import BigButton from '../component/BigButton'
import Game from '../component/Game'


export default function PageError({ message, status }: { message: string, status?: string }) {
	return (
		<div className={'Page404'}>
			{status && <h1>ERROR - {status}</h1>}
			
			<p>{message}</p>
		</div>
	)
}