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
    const { content } = useContext(UserContext) as UserContextValue;

	useEffect(()=>{

	}, [content])

	return (
		content !== null ?
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
		:
		<h1 style={{color: 'white'}}>
			LOGIN
		</h1>
	);
}

export default App;