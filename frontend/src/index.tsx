import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import RightClickMenu from './component/rightClickMenu';
import { RightClickMenuProvider } from './context/rightClickMenu';
import { UserContextProvider } from './context/userContext';

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
