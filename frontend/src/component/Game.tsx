import React, { useEffect } from 'react'

interface gameData {
	width: number,
	height: number,
	widthUnit: number,
	heightUnit: number,
	playerWidth: number,
	playerHeight: number,
	playerOneY : number,
	playerTwoY : number,
	scorePlayerOne : number,
	scorePlayerTwo : number,
	gameUnit : number,
	reset : boolean
}

function compareInterval( IntValOne: number, IntValTwo: number, IntCmpValOne: number, IntCmpValTwo: number ) {

	if (IntValOne <= IntCmpValTwo && IntValTwo > IntCmpValOne)
		return true;
	return false;
}

function player( gameId: string, gameData: gameData, side: string ) {

	// const gameUnit : number = 10000;
	function getRealY( y: number ) : number {
		return y * (gameData.height - gameData.playerHeight) / gameData.gameUnit;
	}
	var incr = (incr : number) => {
		if (side === "left") {
			gameData.playerOneY += incr;
			gameData.playerOneY = gameData.playerOneY < 0 ? 0 : gameData.playerOneY;
			gameData.playerOneY = gameData.playerOneY > gameData.gameUnit ? gameData.gameUnit : gameData.playerOneY;
		}
		else {
			gameData.playerTwoY += incr;
			gameData.playerTwoY = gameData.playerTwoY < 0 ? 0 : gameData.playerTwoY;
			gameData.playerTwoY = gameData.playerTwoY > gameData.gameUnit ? gameData.gameUnit : gameData.playerTwoY;
		}
	}
	var keycode : number = -1;
	var speed : number = 0;
	const maxSpeed : number = 100;
	const friction : number = 4;

	function createElem() {
		var createElem = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		if (side === "left")
			createElem.setAttribute('x', `${gameData.widthUnit*5}`)
		else
			createElem.setAttribute('x', `${gameData.width - gameData.widthUnit*5 - gameData.playerWidth}`)
		createElem.setAttribute('y', '0')
		createElem.setAttribute('width', `${gameData.playerWidth}`);
		createElem.setAttribute('height', `${gameData.playerHeight}`);
		createElem.setAttribute('fill', `black`);
		return createElem;
	}
	var player = createElem();

	var elem = document.getElementById(gameId);
	var root = document.getElementById('root');
	if (!elem || !root)
		return;

	elem.appendChild(player);
	if (side === "left")
	{
		root.addEventListener('keydown', (event) => {
			if (event.keyCode !== 68 && event.keyCode !== 65)
				return;
			keycode = event.keyCode;
		});
	}
	else
	{
		root.addEventListener('keydown', (event) => {
			if (event.keyCode !== 37 && event.keyCode !== 39)
				return;
			keycode = event.keyCode;
		});
	}
	root.addEventListener('keyup', (event) => {
		if (keycode === event.keyCode)
		{
			keycode = -1;
		}
	});

	setInterval(() => {
		//time
		if (side === "left")
		{
			if (keycode === 68 && speed < maxSpeed)
				speed += friction;
			else if (keycode === 65 && speed > -maxSpeed)
				speed -= friction;
		}
		else
		{
			if (keycode === 39 && speed < maxSpeed)
				speed += friction;
			else if (keycode === 37 && speed > -maxSpeed)
				speed -= friction;
		}
		incr(speed);
		if (speed !== 0 && keycode === -1)
			speed = speed > 0 ? speed - friction : speed + friction;

		if (side === "left") {
			player.style.transform = `translateY(${getRealY(gameData.playerOneY)}px)`;
			if (gameData.reset === true)
				gameData.playerOneY = gameData.gameUnit / 2;
		}
		else {
			player.style.transform = `translateY(${getRealY(gameData.playerTwoY)}px)`;
			if (gameData.reset === true)
				gameData.playerTwoY = gameData.gameUnit / 2;
		}
	}, 1);
}

function ball( gameId: string, gameData: gameData ) {

	const gameUnit : number = 10000;
	function getRealY( y: number ) : number {
		return y * gameData.height / gameData.gameUnit;
	}
	function getRealYplayer( y: number ) : number {
		return y * (gameData.height - gameData.playerHeight) / gameData.gameUnit;
	}
	function getRealX( x: number ) : number {
		return x * (gameData.width / 2) / gameData.gameUnit;
	}
	var incrY = (incr : number) => {
		y += incr;
		y = y < 0 ? 0 : y;
		y = y > gameData.gameUnit - 200 ? gameData.gameUnit - 200 : y;
	}
	var dcrY = (dcr : number) => {
		y -= dcr;
		y = y < 0 ? 0 : y;
		y = y > gameData.gameUnit - 200 ? gameData.gameUnit - 200 : y;
	}
	var incrX = (incrx : number) => {
		x += incrx;
		x = x < 0 ? 0 : x;
		x = x > gameData.gameUnit * 2 - 200 ? gameData.gameUnit * 2 - 200 : x;
	}
	var dcrX = (dcrx : number) => {
		x -= dcrx;
		x = x < 0 ? 0 : x;
		x = x > gameData.gameUnit * 2  - 200 ? gameData.gameUnit * 2 - 200 : x;
	}
	var x : number = gameData.gameUnit;
	var y : number = gameData.gameUnit / 2;
	var keycode : number = -1;
	var speed : number = 50;
	const maxSpeed : number = 100;
	const friction : number = 4;

	var start : boolean = false;
	var updwn : boolean = false;
	var lr : boolean = false; 

	function createBall() {
		var createBall = document.createElementNS("http://www.w3.org/2000/svg", "circle");

		createBall.setAttribute('cy', `${gameData.width / 4}`);
		createBall.setAttribute('cx', `${gameData.width / 2 }`);
		createBall.setAttribute('r', `8`);
		createBall.setAttribute('fill', `black`);
		return createBall;
	}
	function createScore(direction: string) {
		var createScore = document.createElementNS("http://www.w3.org/2000/svg", "text");
		if (direction === "right")
		{
			createScore.setAttribute('y', `${gameData.width / 2 - 20}`);
			createScore.setAttribute('x', `${gameData.width / 2 + 50}`);
		}
		else
		{
			createScore.setAttribute('y', `${gameData.width / 2 - 20}`);
			createScore.setAttribute('x', `${gameData.width / 2 - 90}`);
		}
		createScore.setAttribute('font-family', `"Courier New", Courier, monospace;`);
		createScore.setAttribute('font-size', `60px`);
		createScore.setAttribute('fill', `black`);
		createScore.textContent = "";
		return createScore;
	}
	var ball = createBall();
	var scoreLeft = createScore("left");
	var scoreRight = createScore("right");
	var elem = document.getElementById(gameId);
	var root = document.getElementById('root');
	if (!elem || !root)
		return;

	elem.appendChild(ball);
	elem.appendChild(scoreLeft);
	elem.appendChild(scoreRight);
	root.addEventListener('keydown', (event) => {
		if (event.keyCode !== 68 && event.keyCode !== 65 && event.keyCode !== 37 && event.keyCode !== 39)
			return;
		keycode = event.keyCode;
	},);
	root.addEventListener('keyup', (event) => {
		if (keycode === event.keyCode)
		{
			keycode = -1;
		}
	},);
	
	setInterval( () => {
		if (keycode === 68 || keycode === 65 || keycode === 39 || keycode === 37)
		{
			start = true;
			gameData.reset = false;
		}
		if (start === true)
		{
			console.log(getRealYplayer(gameData.playerTwoY));
			console.log(getRealYplayer(gameData.playerOneY));
			if (updwn === false)
			{
				incrY(speed);
				if (getRealY(y) + Number(ball.getAttribute("r")) === getRealYplayer(gameData.playerOneY)
				&& compareInterval(getRealX(x) - Number(ball.getAttribute("r")), getRealX(x) + Number(ball.getAttribute("r")), 
				gameData.widthUnit*5, gameData.widthUnit*5 + gameData.playerWidth))
					updwn = true;
				if (getRealY(y) + Number(ball.getAttribute("r")) === getRealYplayer(gameData.playerTwoY)
				&& compareInterval(getRealX(x) - Number(ball.getAttribute("r")), getRealX(x) + Number(ball.getAttribute("r")), 
				gameData.width - gameData.widthUnit*5 - gameData.playerWidth, gameData.width - gameData.widthUnit*5))
					updwn = true;
					//Lower Boundary
					if (getRealY(y) === gameData.height - Number(ball.getAttribute("r"))) {
						updwn = true;
						// speed += 10;
						// console.log();
					}
				}
			console.log(getRealY(y));
			if (updwn === true)
			{
				dcrY(speed);
				//PlayerOne
				if (getRealY(y) - Number(ball.getAttribute("r")) === getRealYplayer(gameData.playerOneY) + gameData.playerHeight
				&& compareInterval(getRealX(x) - Number(ball.getAttribute("r")), getRealX(x) + Number(ball.getAttribute("r")), 
				gameData.widthUnit*5, gameData.widthUnit*5 + gameData.playerWidth))
					updwn = false; 
				//PlayerTwo
				if (getRealY(y) - Number(ball.getAttribute("r")) === getRealYplayer(gameData.playerTwoY) + gameData.playerHeight
				&& compareInterval(getRealX(x) - Number(ball.getAttribute("r")), getRealX(x) + Number(ball.getAttribute("r")), 
				gameData.width - gameData.widthUnit*5 - gameData.playerWidth, gameData.width - gameData.widthUnit*5))
					updwn = false;
				//Upper Boundary
				if (getRealY(y) === Number(ball.getAttribute("r"))) {
					updwn = false;
					// speed += 10;
				}
			}
			if (lr === false)
			{
				incrX(speed);
				if ((gameData.width - gameData.widthUnit*5 - gameData.playerWidth - Number(ball.getAttribute("r")) / 2 === getRealX(x)
				&& compareInterval(getRealY(y) - Number(ball.getAttribute("r")), getRealY(y) + Number(ball.getAttribute("r")),getRealYplayer(gameData.playerTwoY), getRealYplayer(gameData.playerTwoY) + gameData.playerHeight)))
					lr = true;
				if (getRealX(x) === gameData.width - Number(ball.getAttribute("r")))
				{
					//Right Goal
					start = false;
					if (gameData.reset !== true)
						gameData.scorePlayerOne++;
					gameData.reset = true;
					ball.style.transform = `initial`;
					x = gameData.gameUnit;
					y = gameData.gameUnit / 2;
					lr = true;
				}
			}
			if (lr === true)
			{
				dcrX(speed);
				if ((gameData.widthUnit*5 + gameData.playerWidth + Number(ball.getAttribute("r")) === getRealX(x) 
				&& compareInterval(getRealY(y) - Number(ball.getAttribute("r")), getRealY(y) + Number(ball.getAttribute("r")), 
				getRealYplayer(gameData.playerOneY), getRealYplayer(gameData.playerOneY) + gameData.playerHeight)))
					lr = false;
				if (getRealX(x) <= Number(ball.getAttribute("r")))
				{
					//left Goal
					start = false;
					if (gameData.reset !== true)
						gameData.scorePlayerTwo++;
					gameData.reset = true;
					ball.style.transform = `initial`;
					x = gameData.gameUnit;
					y = gameData.gameUnit / 2;
					lr = false;
				}
			}
			if (start === true)
				ball.style.transform = `translate(${getRealX(x) - 400}px, ${getRealY(y) - 200}px)`;
				// if (speed !== 0 && keycode === -1)
				// speed = speed > 0 ? speed - friction : speed + friction;
			}
			if (gameData.scorePlayerTwo === 4 || gameData.scorePlayerOne === 4) {
					gameData.scorePlayerTwo = 0;
					gameData.scorePlayerOne = 0;
			}
			scoreRight.textContent = gameData.scorePlayerOne.toString();
			scoreLeft.textContent = gameData.scorePlayerTwo.toString();
	}, 10);
	
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
		playerHeight: width / 2 / 100 * 30,
		gameUnit: 10000,
		playerOneY: 10000 / 2,
		playerTwoY: 10000 / 2,
		scorePlayerOne: 0,
		scorePlayerTwo: 0,
		reset: false
	}

	useEffect(() => {
		ball( gameId, gameData );
		player( gameId, gameData, "right" );
		player( gameId, gameData,"left" );
		// player1( gameId, gameData );
	})
	
	/* player */
	return (
		<div className='gameArena' tabIndex={-1}>
			<svg id={gameId} width={gameData.width} height={gameData.height} version="1.1" xmlns="http://www.w3.org/2000/svg">
				
				<rect x={0} y={0} width={gameData.width} height={gameData.height} fill="white" strokeWidth="5"/>
				<line x1={gameData.width/2} x2={gameData.width/2} y1={0} y2={gameData.height} stroke="black" strokeWidth="5" strokeDasharray={`${gameData.heightUnit*4} ${gameData.heightUnit*2}`}/>

				{/* <circle cx={10} cy={10} r={8} fill="black" /> */}
				{/* <Player gameData={gameData} y={50} position={"left"} /> */}
				{/* <Player gameData={gameData} y={50} position={"right"} /> */}
			</svg>
			
		</div>
	)
}
