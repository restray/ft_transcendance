import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { NameWithMenu } from '../component/ProfilBox'
import Page404 from './Page404'
import addFriend from '../images/friendAdd.svg'
import settings from '../images/settings.svg'
import block from '../images/block.svg'
import send from '../images/send.svg'
import { UserContext, UserContextValue } from '../context/userContext'
import { protectedFetch } from '../lib/fetchImprove'
import { User } from '../context/chatContext'
import { BACKEND_HOSTNAME } from '../envir'

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
				{/* <NameWithMenu name={game.nameA}/> */}
				{game.nameA}
				<span> {game.scoreA} | {game.scoreB} </span> 
				{/* <NameWithMenu name={game.nameB}/> */}
				{game.nameB}
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

	var [searchParams] = useSearchParams()
	const { token, deleteToken, content: cUser } = useContext(UserContext) as UserContextValue
	const [state, setState] = useState<'loading' | 'valid' | 'invalid'>('loading')
	const [user, setUser] = useState<User>({name: '', avatar: '', id: 0})

	var userId = searchParams.get("userId");

	useEffect(()=>{
		if (userId === null)
		{
			setState('invalid')
			return
		}
		protectedFetch({
			token, deleteToken,
			url: `/profile/${userId}`, method: 'GET',
			onSuccess: (data: Response)=>{
				if (data.status === 200) {
					console.log(data)
					data.json().then((data: User)=>{
						setState('valid')
						setUser(data)
					}).catch()
				} else {
					setState('invalid')
				}
			}
		})
			
	}, [userId, token, deleteToken])

	/*menu */
	let navigate = useNavigate()
	function goSettings() {
		navigate(`/settings`)
	}
	/*menu*/

	if (state === 'loading')
	return (
		<Page404 message={`Profile is loading`} />
	)
	else if (state === 'invalid')
	return (
		<Page404 message={`Can't find this profile :(`} />
	)
	return (
		<>
			<div className='ProfilPage'>
				<div className='ProfilPage__image'>
					<img src={`${BACKEND_HOSTNAME}/${user.avatar}`} alt=''/>
				</div>
				<p className={'ProfilPage__name'}>
					<NameWithMenu user={user} />
				</p>
			</div>
			<div className='ProfilPage__menu'>
			{
				cUser.id === user.id ?
					<img src={settings} alt='' onClick={goSettings}/>
				:
				<>
					<img src={addFriend} alt=''/>
					<img src={block} alt=''/>
					<img src={send} alt=''/>
				</>
			}
			</div>
			<Winrate />
			<History name={'not working'}/>
			<div className='ProfilPage__bottomBox'>Add to friends</div>
		</>
	)
}
