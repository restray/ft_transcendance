import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import RightClickMenu from './component/rightClickMenu';
import { RightClickMenuProvider } from './context/rightClickMenu';
import { UserContextProvider } from './context/userContext';

export const HEADERS = { 
	'Content-Type': 'application/json;charset=UTF-8',
	'Accept': 'application/json',
	'Access-Control-Allow-Origin': '*',
}


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
	<BrowserRouter>
		<RightClickMenuProvider>
			<UserContextProvider>
				<React.StrictMode>
					<App />
					<RightClickMenu />
				</React.StrictMode>
			</UserContextProvider>
		</RightClickMenuProvider>
	</BrowserRouter>

);
