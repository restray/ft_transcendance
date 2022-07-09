import React, {createContext, useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import fetchWithToken, { checkToken } from '../lib/fetchImprove';
export const UserContext = createContext<UserContextValue | null>(null);

export interface UserContextValueState {

	name: string;
	avatar: string;
	id: number
}


export interface UserContextValue {

	content: UserContextValueState,
	token: string | null,
	deleteToken: ()=>void,
    login: ()=>void
}

export const UserContextProvider = ( {children}: { children: JSX.Element} ) => {
    const [state, setState] = useState<UserContextValueState>({name:'',avatar:'', id: 0})
    const [token, setToken] = useState<string | null>(null)
	var [searchParams, setSearchParams] = useSearchParams()

	function deleteToken() {
		setToken(null)
		localStorage.removeItem('userToken')
		console.log('deleting')
	}

	useEffect(()=>{
		checkToken(token,
			(token: string)=>fetchWithToken<any>({token, deleteToken, url: `/profile`,
				callback: (data: any)=>{
					setState({
						name: data.name,
						avatar: data.avatar,
						id: data.id
					})
				}})
		)
	}, [token])

    useEffect(()=>{
        var code = searchParams.get('code')
		var userToken = localStorage.getItem('userToken')

		if (userToken)
		{
			setToken(userToken)
			return
		}
        if (code)
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
				if (data)
				{
					setToken(data.access_token)
					localStorage.setItem('userToken', data.access_token)
				}
            })
        }
		setSearchParams(searchParams)
		
    }, [])

	function login() {
		document.location.href="https://api.intra.42.fr/oauth/authorize?client_id=26b634b716649363e01ab4a47f888a4f886a3dbd295b5db57140a068eda483bf&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2F&response_type=code"; 
	}

    const value: UserContextValue = {
        content: state,
        token: token,
		deleteToken: deleteToken,
        login: login
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}