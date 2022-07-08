import React, {createContext, useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
export const UserContext = createContext<UserContextValue | null>(null);

export interface UserContextValueState {

	name: string;
	avatar: string;
}


export interface UserContextValue {

	content: UserContextValueState,
	token: string | null,
    login: ()=>void
}

export const UserContextProvider = ( {children}: { children: JSX.Element} ) => {
    const [state, setState] = useState<UserContextValueState>({name:'',avatar:''})
    const [token, setToken] = useState<string | null>(null)
	var [searchParams, setSearchParams] = useSearchParams()

	function getInfo(access_token: string) {

		console.log(access_token)
		fetch(`http://localhost:3000/profile`, {
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Accept': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Authorization': `Bearer ${access_token}`
			},
			method: 'GET'
		})
		.then(response => response.json())
		.then(data => {
			console.log(data)
			if (data.statusCode === 401)
				localStorage.removeItem('userToken')
			else {
				setState({
					name: data.name,
					avatar: data.avatar
				})
				setToken(access_token)
			}
		})
		.catch(()=>{})
		localStorage.setItem('userToken', access_token)
	}

    useEffect(()=>{
        var code = searchParams.get('code')
		// var userToken = localStorage.getItem('userToken')
		var userToken = null
		searchParams.delete('code')

        if (code !== null && userToken === null)
        {
			fetch(`http://localhost:3000/auth/login?code=${code}`, {
				headers: {
					'Content-Type': 'application/json;charset=UTF-8',
					'Accept': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
				method: 'GET'
			})
			.then(response => response.json())
			.then(data => {
				console.log(data)
				getInfo(data.access_token)
            })
			.catch(()=>{})
        }
		setSearchParams(searchParams)
    }, [])

	function login() {
		document.location.href="https://api.intra.42.fr/oauth/authorize?client_id=26b634b716649363e01ab4a47f888a4f886a3dbd295b5db57140a068eda483bf&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2F&response_type=code"; 
	}

    const value: UserContextValue = {
        content: state,
        token: token,
        login: login
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}