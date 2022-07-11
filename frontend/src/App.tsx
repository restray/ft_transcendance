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
import Settings from './pages/Settings';

function App() {
	const constraintsRef = useRef(null);
    const { content, token, login } = useContext(UserContext) as UserContextValue;

	return (
		token === null ?
		<h1 style={{color: 'white'}} onClick={login}>
		LOGIN
		</h1>
		:
		<div className="App">
			<Header />
			<div className='workZone' ref={constraintsRef}>
				<ChatIcon constraintsRef={constraintsRef}/>
				<div className="workZone__page flexContainer">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path='profile' element={<Profile />} />
							<Route path='settings' element={<Settings />} />
						</Routes>
				</div>
			</div>
		</div>
	);
}

export default App;