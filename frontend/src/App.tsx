import React, {useContext, useEffect, useRef} from 'react';
import ChatIcon from './component/ChatIcon';
// import Game from './component/Game';
import Home from './pages/Home';
import Header from './component/Header';
import './main.scss'
import { motion } from "framer-motion"
import Profile from './pages/Profile';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext, UserContextValue } from './context/userContext';

function App() {
	const constraintsRef = useRef(null);
    const { content, token, login } = useContext(UserContext) as UserContextValue;

	useEffect(()=>{
		console.log(content)
	}, [content])

	return (
		content.id === 0 ?
		<h1 style={{color: 'white'}} onClick={login}>
		LOGIN
		</h1>
		:
		<div className="App">
			<Header />
			<div className='workZone' ref={constraintsRef}>
				<ChatIcon constraintsRef={constraintsRef}/>
				<motion.div
					className="workZone__page flexContainer"
					drag
					dragSnapToOrigin={true}
					dragConstraints={constraintsRef}
					dragMomentum={false}
				>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path='profile' element={<Profile />} />
						</Routes>
				</motion.div>
			</div>
		</div>
	);
}

export default App;