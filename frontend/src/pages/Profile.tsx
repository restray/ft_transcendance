import React, { useContext, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ProfilBox, { NameWithMenu } from '../component/ProfilBox'
import Page404 from './Page404'
import addFriend from '../images/friendAdd.svg'
import block from '../images/block.svg'
import send from '../images/send.svg'
import { UserContext, UserContextValue } from '../context/userContext'
import { setConstantValue } from 'typescript'
import { HEADERS } from '..'

interface resumeGame {
	date: string,
	nameA: string,
	nameB: string,
	scoreA: number,
	scoreB: number,
	time: string
}

function HistoryGame( { game }: {game: resumeGame} ) {

	return (
		<div className='History__game'>
			<span className='History__game__date'>{game.date}</span>
			<span>
				<NameWithMenu name={game.nameA}/>
				<span> {game.scoreA} | {game.scoreB} </span> 
				<NameWithMenu name={game.nameB}/>
			</span>
			<span className='History__game__time'>{game.time}</span>
		</div>
	)
}

function History({ name }: { name: string }) {

	var games: resumeGame[] = [
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
		{date:'04/07/22',nameA:name,nameB:'pleveque',scoreA:5,scoreB:2,time:'3:18'},
	]

	return (
		<div className='History'>
			{games.map((game, index) =>
				<HistoryGame key={index} game={game}/> 
			)}
		</div>
	)
}

function Winrate() {

	var win: number = 72;
	var lose: number = 28;

	return (
		<div className='Winrate'>
			<span className='Winrate__score'>720win 280loses</span>
			<div className='Winrate__win' style={{ width: `${win}%`}}></div>
			<div className='Winrate__lose' style={{ width: `${lose}%`}}></div>
		</div>
	)
}

export default function Profile() {

	var [searchParams, setSearchParams] = useSearchParams();
	const { token } = useContext(UserContext) as UserContextValue;
	const [state, setState] = useState<string>('loading')

	var name = searchParams.get("name");

	useEffect(()=>{
		if (name && token)
		{
			// fetch(`http://localhost:3000/profile`, {
			// method: 'GET',
			// headers: { ...HEADERS, 'Authorization': `Bearer ${token}`},
			// }).then(response => response.json())
			// .then(data: {name:string, avatar: string} => {
			// 	console.log(data)
			// 	if (data.statusCode === 401)
			// 		localStorage.removeItem('userToken')
			// 	else {
			// 		setState({
			// 			name: data.name,
			// 			avatar: data.avatar
			// 		})
			// 		setToken(access_token)
			// 	}
			// }).catch(()=>{})
			setState('valid')
		}
		else
			setState('invalid')
	}, [searchParams])

	if (state === 'loading')
	return (
		<Page404 message={`Profile is loading`} />
	)
	else if (state === 'invalid' || name === null)
	return (
		<Page404 message={`Can't find profile ${name}`} />
	)
	return (
		<>
			<div className='ProfilPage'>
				<div className='ProfilPage__image'></div>
				<p className={'ProfilPage__name'}>
					<NameWithMenu name={name} />
				</p>
			</div>
			<div className='ProfilPage__menu'>
				<img src={addFriend} alt=''/>
				<img src={block} alt=''/>
				<img src={send} alt=''/>
			</div>
			<Winrate />
			<History name={name}/>
			<div className='ProfilPage__bottomBox'>Add to friends</div>
		</>
	)
}
