import { forEach } from 'lodash';
import React, { useEffect, useRef, useState } from 'react'
import Modal, { HiddedModal } from './Modal';
import ModalBox from './ModalBox';

function player( gameId: string, gameRef: any[] ) {

	console.log('game creation')
	
	var y: number = 0;
	var direction: string | null = null;

	function createElem( direction: string ) {
		var createElem = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		if (direction === 'left')
			createElem.setAttribute('x', '5%')
		else
			createElem.setAttribute('x', '93%')
		createElem.setAttribute('y', '0')
		createElem.setAttribute('width', '2%');
		createElem.setAttribute('height', '30%');
		createElem.setAttribute('fill', `black`);
		return createElem;
	}
	
	// <div className='padLeft' onTouchStart={left} onClick={e=>e.stopPropagation()}
	// onTouchEnd={releasePress}/>
	// <div className='padRight' onTouchStart={right} onClick={e=>e.stopPropagation()}
	// onTouchEnd={releasePress}/>

	var mapPlayers: any[] = []
	gameRef.forEach((ref)=>{
		var svgRef = ref.ref.querySelector('svg')

		var leftPlayer = createElem('left');
		leftPlayer.classList.add('gameArena--leftPlayer')
		var rightPlayer = createElem('right');
		rightPlayer.classList.add('gameArena--rightPlayer')
		svgRef.appendChild(leftPlayer);
		svgRef.appendChild(rightPlayer);
		mapPlayers.push({leftPlayer, rightPlayer})

		if (ref.mobileControl) {
			var leftPad = document.createElement('div')
			leftPad.className = 'padLeft'
			ref.ref.appendChild(leftPad);
			leftPad.addEventListener('touchstart', (e)=>{
				direction = 'up'
			})
			leftPad.addEventListener('touchend', (e)=>{
				if (direction === 'up')
					direction = null
			})
			leftPad.addEventListener('click', (e)=>{
				e.stopPropagation()
			})
	
			var rightPad = document.createElement('div')
			rightPad.className = 'padRight'
			ref.ref.appendChild(rightPad);
			rightPad.addEventListener('touchstart', (e)=>{
				direction = 'down'
			})
			rightPad.addEventListener('touchend', (e)=>{
				if (direction === 'down')
					direction = null
			})
			rightPad.addEventListener('click', (e)=>{
				e.stopPropagation()
			})
		}
	})

	var root = document.getElementById('root');
	if (!root)
		return;

	root.addEventListener('keydown', (event) => {
		if (event.keyCode === 68)
			direction = 'down'
		else if (event.keyCode === 65)
			direction = 'up'
	});
	root.addEventListener('keyup', (event) => {
		if (direction === 'down' && event.keyCode === 68)
			direction = null
		if (direction === 'up' && event.keyCode === 65)
			direction = null
	});

	return setInterval(() => {
		//time
		if (direction === 'up') {
			y += 1
			if (y > 100 - 30)
				y = 100 -30
		}
		else if (direction === 'down')
			y = y-1 < 0 ? 0 : y-1

		mapPlayers.forEach((players: any)=>{
			players.leftPlayer.style.transform = `translateY(${y}%)`;
			players.rightPlayer.style.transform = `translateY(${y}%)`;
		})
	}, 1)
}

function GameModal({gameId, gameRef, open, setOpen}:
{gameId: string, gameRef: any, open: boolean, setOpen: (dir: boolean)=>void}) {

	return (
		<HiddedModal open={open} setOpen={(dir: boolean)=>{}}>
			<div className='bigArena' onClick={()=>setOpen(false)}>
				<div className='innerArena'>
					<GameArena gameId={gameId} gameRef={gameRef} />
				</div>
			</div>
		</HiddedModal>
	)
}

function GameArena({gameId, gameRef, onClick}: {gameId: string, gameRef: any, onClick?: ()=>void}) {

	function eventClick(e: any) {
		e.preventDefault()
		if (onClick) onClick()
	}

	return (
		<div className='gameArena--container' onClick={eventClick}>
			<div ref={gameRef} className='gameArena' tabIndex={1}>
				<svg className={gameId} width={'100%'} height={'100%'} version="1.1" xmlns="http://www.w3.org/2000/svg">
					<rect x={0} y={0} width={'100%'} height={'100%'} fill="white" strokeWidth="5"/>
					<line x1={'50%'} x2={'50%'} y1={0} y2={'100%'} stroke="black" strokeWidth="1%" strokeDasharray={`3.2% 1.2%`}/>
				</svg>
			</div>
			<div className='gameArena__players'>
				<div className='gameArena__players__profile'>
					<span className='gameArena__players__profile__name'>pleveque</span>
					<div className='gameArena__players__profile__image'></div>
				</div>
				<div className='gameArena__players__profile'>
					<div className='gameArena__players__profile__image'></div>
					<span className='gameArena__players__profile__name'>Tbelhomm</span>
				</div>
			</div>
		</div>
	)
}

export default function Game() {

	const [gameLoop, setGameLoop] = useState<any | undefined>(undefined)
	const gameRef = useRef<any>(null)
	const gameRef2 = useRef<any>(null)
	const [bigScreen, setBigScreen] = useState<boolean>(false)


	// useEffect(()=>{
	// 	gameRef?.current?.focus()
	// }, [gameRef])

	var gameId: string = "gameid0";

	useEffect(() => {
		if (!gameRef || gameRef.current == false)
			return
		if (!gameRef2 || gameRef2.current == false)
			return
		/* clean possible residue before starting game again  */
		var leftPlayer = document.querySelectorAll('.gameArena--leftPlayer')
		leftPlayer.forEach((player)=> player.remove())
		var rightPlayer = document.querySelectorAll('.gameArena--rightPlayer')
		rightPlayer.forEach((player)=> player.remove())
		var padLeft = document.querySelectorAll('.padLeft')
		padLeft.forEach((player)=> player.remove())
		var padRight = document.querySelectorAll('.padRight')
		padRight.forEach((player)=> player.remove())

		var game = player(gameId, [
			{ref: gameRef.current, mobileControl: false},
			{ref: gameRef2.current, mobileControl: true}
		])
		if (game) {
			setGameLoop(game)
		}
	}, [gameRef, gameRef2])

	useEffect(()=> {
		return (()=>{
			if (gameLoop)
				clearInterval(gameLoop)
		})
	}, [gameLoop])

	function openGame() {
		setBigScreen(true)
	}

	/* player */
	return (
		<>
			<GameArena gameId={gameId} gameRef={gameRef} onClick={openGame}/>
			<GameModal gameId={gameId} gameRef={gameRef2} open={bigScreen} setOpen={setBigScreen}/>
		</>
	)
}
