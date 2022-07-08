import React, {useEffect, useRef, useState} from 'react'
import BigButton from '../component/BigButton'
import Game from '../component/Game'
import MatchMakingButton from '../component/MatchMakingBox'
import ProfilBox from '../component/ProfilBox'


export default function Home() {
	return (
		<div className={'home'}>
			<MatchMakingButton>
				<BigButton name={'play ranked'}/>
			</MatchMakingButton>
			<div className={'home__game'}>
				<Game />
			</div>
			<div className={'home__profile'}>
				<ProfilBox name={'pleveque'} />
			</div>
		</div>
	)
}