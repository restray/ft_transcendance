import React, { useEffect } from 'react'

interface gameData {
	width: number,
	height: number,
	widthUnit: number,
	heightUnit: number,
	playerWidth: number,
	playerHeight: number
}

function player( gameId: string, gameData: gameData ) {

	const gameUnit : number = 10000;
	function getRealY( y: number ) : number {
		return y * (gameData.height - gameData.playerHeight) / gameUnit;
	}
	var incr = (incr : number) => {
		y += incr;
		y = y < 0 ? 0 : y;
		y = y > gameUnit ? gameUnit : y;
	}
	var y : number = gameUnit / 2;
	var keycode : number = -1;
	var speed : number = 0;
	const maxSpeed : number = 100;
	const friction : number = 4;

	function createElem( direction: string ) {
		var createElem = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		if (direction === 'left')
			createElem.setAttribute('x', `${gameData.widthUnit*5}`)
		else
			createElem.setAttribute('x', `${gameData.width - gameData.widthUnit*5 - gameData.playerWidth}`)
		createElem.setAttribute('y', '0')
		createElem.setAttribute('width', `${gameData.playerWidth}`);
		createElem.setAttribute('height', `${gameData.playerHeight}`);
		createElem.setAttribute('fill', `black`);
		return createElem;
	}
	var leftPlayer = createElem('left');
	var rightPlayer = createElem('right');

	var elem = document.getElementById(gameId);
	var root = document.getElementById('root');
	if (!elem || !root)
		return;

	elem.appendChild(leftPlayer);
	elem.appendChild(rightPlayer);
	root.addEventListener('keydown', (event) => {
		if (event.keyCode !== 68 && event.keyCode !== 65)
			return;
		keycode = event.keyCode;
	});
	root.addEventListener('keyup', (event) => {
		if (keycode === event.keyCode)
		{
			keycode = -1;
		}
	});

	setInterval(() => {
		
		//time
		if (keycode === 68 && speed < maxSpeed)
			speed += friction;
		else if (keycode === 65 && speed > -maxSpeed)
			speed -= friction;
		incr(speed);
		if (speed !== 0 && keycode === -1)
			speed = speed > 0 ? speed - friction : speed + friction;

		leftPlayer.style.transform = `translateY(${getRealY(y)}px)`;
		rightPlayer.style.transform = `translateY(${getRealY(y)}px)`;
	}, 1);
}

export default function Game() {

	var gameId: string = "gameid0";
	var width : number = 800;
	var gameData: gameData = {
		width: width,
		height: width / 2,
		widthUnit: width / 100,
		heightUnit: width / 2 / 100,
		playerWidth: width / 100 * 2,
		playerHeight: width / 2 / 100 * 30
	}

	useEffect(() => {
		player( gameId, gameData );
	})
	

	/* player */
	return (
		<div className='gameArena' tabIndex={-1}>
			<svg id={gameId} width={gameData.width} height={gameData.height} version="1.1" xmlns="http://www.w3.org/2000/svg">
				
				<rect x={0} y={0} width={gameData.width} height={gameData.height} fill="white" strokeWidth="5"/>
				<line x1={gameData.width/2} x2={gameData.width/2} y1={0} y2={gameData.height} stroke="black" strokeWidth="5" strokeDasharray={`${gameData.heightUnit*4} ${gameData.heightUnit*2}`}/>

				{/* <Player gameData={gameData} y={50} position={"left"} /> */}
				{/* <Player gameData={gameData} y={50} position={"right"} /> */}
			</svg>
		</div>
	)
}
