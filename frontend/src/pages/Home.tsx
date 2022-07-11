import React, {useEffect, useRef, useState} from 'react'
import BigButton from '../component/BigButton'
import Game from '../component/Game'
import MatchMakingButton from '../component/MatchMakingBox'


export default function Home() {
	return (
		<div className={'home'}>
			<MatchMakingButton>
				<BigButton name={'play ranked'}/>
			</MatchMakingButton>
			<div className={'home__game'}>
				<Game />
			</div>
		</div>
	)
}