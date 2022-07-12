import { max, random } from 'lodash';
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
	reset : boolean,
	elem : HTMLElement | null,
	root : HTMLElement | null
}


function player( gameId: string, gameData: gameData, side: string ) {

	// const gameUnit : number = 10000;
	function getRealY( y: number ) : number {
		return y * (gameData.height - gameData.playerHeight) / gameData.gameUnit;
	}
	var incr = (incr : number) => {
		if (side === "left") {
			gameData.playerOneY += incr;
			gameData.playerOneY = gameData.playerOneY < 1000 ? 1000 : gameData.playerOneY;
			gameData.playerOneY = gameData.playerOneY > gameData.gameUnit - 1000 ? gameData.gameUnit - 1000 : gameData.playerOneY;
		}
		else {
			gameData.playerTwoY += incr;
			gameData.playerTwoY = gameData.playerTwoY < 1000 ? 1000 : gameData.playerTwoY;
			gameData.playerTwoY = gameData.playerTwoY > gameData.gameUnit - 1000 ? gameData.gameUnit - 1000 : gameData.playerTwoY;
		}
	}
	var keycode : number = -1;
	var speed : number = 0;
	const maxSpeed : number = 80;
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

	// var elem = document.getElementById(gameId);
	// var root = document.getElementById('root');
	if (!gameData.elem || !gameData.root)
		return;

	gameData.elem.appendChild(player);
	if (side === "left")
	{
		gameData.root.addEventListener('keydown', (event) => {
			if (event.keyCode !== 68 && event.keyCode !== 65)
				return;
			keycode = event.keyCode;
		});
	}
	else
	{
		gameData.root.addEventListener('keydown', (event) => {
			if (event.keyCode !== 37 && event.keyCode !== 39)
				return;
			keycode = event.keyCode;
		});
	}
	gameData.root.addEventListener('keyup', (event) => {
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
	function getRealX( x: number ) : number {
		return x * (gameData.width / 2) / gameData.gameUnit;
	}
	function getRealYplayer( y: number ) : number {
		return y * (gameData.height - gameData.playerHeight) / gameData.gameUnit;
	}
	var x : number = gameData.gameUnit;
	var y : number = gameData.gameUnit / 2;
	var speedX : number = 50;
	var speedY : number = -5;
	var keycode : number = -1;
	const maxSpeed : number = 180;

	var start : boolean = false;

	function createBall() {
		var createBall = document.createElementNS("http://www.w3.org/2000/svg", "circle");

		createBall.setAttribute('cy', `${gameData.height / 2}`);
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
	// var elem = document.getElementById(gameId);
	// var root = document.getElementById('root');
	if (!gameData.elem || !gameData.root)
		return;

	gameData.elem.appendChild(ball);
	gameData.elem.appendChild(scoreLeft);
	gameData.elem.appendChild(scoreRight);
	gameData.root.addEventListener('keydown', (event) => {
		if (event.keyCode !== 32)
			return;
		keycode = event.keyCode;
	},);
	gameData.root.addEventListener('keyup', (event) => {
		if (keycode === event.keyCode)
		{
			keycode = -1;
		}
	},);

	setInterval( () => {
		if (keycode === 32)
		{
			start = true;
			gameData.reset = false;
		}

		if (start === true)
		{
			//Upper and Lower Boundary
			if (getRealY(y) > gameData.height - Number(ball.getAttribute("r")) || getRealY(y) < Number(ball.getAttribute("r"))) {
				speedY *= -1;
			}
			//Player One
			if (getRealY(y) + Number(ball.getAttribute("r")) > getRealYplayer(gameData.playerOneY) && 
			getRealY(y) - Number(ball.getAttribute("r")) < getRealYplayer(gameData.playerOneY) + gameData.playerHeight
			&& getRealX(x) - Number(ball.getAttribute("r")) < gameData.widthUnit*5 + gameData.playerWidth
			&& getRealX(x) + Number(ball.getAttribute("r")) > gameData.widthUnit*5) {
				speedX *= -1.2;
				if (getRealY(y) + Number(ball.getAttribute("r")) > getRealYplayer(gameData.playerOneY) + 50 && 
				getRealY(y) - Number(ball.getAttribute("r")) < getRealYplayer(gameData.playerOneY) + gameData.playerHeight - 50)
					speedY *= -1.2;
				else if (getRealY(y)  <= getRealYplayer(gameData.playerOneY) + 50)
					speedY = -Math.abs(speedX);
				else if (getRealY(y)  >= getRealYplayer(gameData.playerOneY) + gameData.playerHeight - 50)
					speedY = Math.abs(speedX);
			}
			
			//Player Two
			if (getRealY(y) + Number(ball.getAttribute("r")) > getRealYplayer(gameData.playerTwoY) && 
			getRealY(y) - Number(ball.getAttribute("r")) < getRealYplayer(gameData.playerTwoY) + gameData.playerHeight
			&& getRealX(x) + Number(ball.getAttribute("r")) > gameData.width - gameData.widthUnit*5 - gameData.playerWidth
			&& getRealX(x) - Number(ball.getAttribute("r")) < gameData.width - gameData.widthUnit*5) {
				speedX *= -1.2;
				if (getRealY(y) + Number(ball.getAttribute("r")) > getRealYplayer(gameData.playerTwoY) + 50 && 
				getRealY(y) - Number(ball.getAttribute("r")) < getRealYplayer(gameData.playerTwoY) + gameData.playerHeight - 50)
					speedY *= -1.2;
				else if (getRealY(y) - Number(ball.getAttribute("r")) >= getRealYplayer(gameData.playerTwoY) + gameData.playerHeight - 50)
					speedY = Math.abs(speedX); // lower segment of the paddle
				else if (getRealY(y) + Number(ball.getAttribute("r")) <= getRealYplayer(gameData.playerTwoY) + 50)
					speedY = -Math.abs(speedX); // upper segment of the paddle
			}
		
			speedX = speedX > maxSpeed ? maxSpeed : speedX;
			speedX = speedX < -maxSpeed ? -maxSpeed : speedX;
			speedY = speedY > maxSpeed ? maxSpeed : speedY;
			speedY = speedY < -maxSpeed ? -maxSpeed : speedY;

			y += Math.floor(speedY);
			x += Math.floor(speedX);
			//Right Goal
			if (getRealX(x) + Number(ball.getAttribute("r")) >= gameData.width)
			{
				start = false;
				if (gameData.reset !== true)
					gameData.scorePlayerOne++;
				gameData.reset = true;
				ball.style.transform = `initial`;
				x = gameData.gameUnit;
				y = gameData.gameUnit / 2;
				speedX = 50;
				speedY = -5;
			}
			//left Goal
			if (getRealX(x) <= Number(ball.getAttribute("r")))
			{
				start = false;
				if (gameData.reset !== true)
					gameData.scorePlayerTwo++;
				gameData.reset = true;
				ball.style.transform = `initial`;
				x = gameData.gameUnit;
				y = gameData.gameUnit / 2;
				speedX = 50;
				speedY = -5;
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
		reset: false,
		elem : document.getElementById(gameId),
		root : document.getElementById(`root`)

	}
	// console.log(gameData.playerHeight);


	useEffect(() => {
		// console.log("hsello");
		player( gameId, gameData, "left" );
		player( gameId, gameData, "right" );
		ball( gameId, gameData );
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
