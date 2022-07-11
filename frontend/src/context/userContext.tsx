import React, {createContext, useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import fetchWithToken, { checkToken, protectedFetch, protectedFetchFormData } from '../lib/fetchImprove';
import { ConnectedUserWithImg } from '../pages/Settings';
import { ConnectedUser } from './chatContext';
export const UserContext = createContext<UserContextValue | null>(null);

export interface UserContextValueState {

	name: string;
	avatar: string;
	id: number
}


export interface UserContextValue {

	content: ConnectedUser,
	token: string | null,
	deleteToken: ()=>void,
    login: ()=>void,
	updateProfile: (profile: ConnectedUserWithImg, onSuccess: (data: any)=>void)=>void,
	enable2fa: ()=>void
}

export const UserContextProvider = ( {children}: { children: JSX.Element} ) => {
	const initState: ConnectedUser = {name:'',avatar:'', id: 0, otp_enable: false}

    const [state, setState] = useState<ConnectedUser>(initState)
    const [token, setToken] = useState<string | null>(null)
	var [searchParams, setSearchParams] = useSearchParams()

	function deleteToken() {
		setToken(null)
		setState(initState)
		localStorage.removeItem('userToken')
		setState({name:'',avatar:'',id:0, otp_enable: false})
		console.log('deleting')
	}

	useEffect(()=>{
		checkToken(token,
			(token: string)=>fetchWithToken<any>({token, deleteToken, url: `/profile`,
				callback: (data: any)=>{
					var image: string = `http://localhost:3000/${data.avatar}`
					console.log(image)
					setState({
						name: data.name,
						avatar: image,
						id: data.id,
						otp_enable: data.otp_enable
					})
				}}).then(data=>console.log(data))
		)
	}, [token])

    useEffect(()=>{
        var code = searchParams.get('code')
		var userToken = localStorage.getItem('userToken')

		if (userToken)
		{
			searchParams.delete('code')
			setSearchParams(searchParams)
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
		searchParams.delete('code')
		setSearchParams(searchParams)
    }, [])

	function login() {
		document.location.href="https://api.intra.42.fr/oauth/authorize?client_id=26b634b716649363e01ab4a47f888a4f886a3dbd295b5db57140a068eda483bf&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2F&response_type=code"; 
	}

	async function updateProfile(profile: ConnectedUserWithImg, onSuccess: (data: any)=>void) {

		var formData: FormData = new FormData()
		formData.append('name', profile.name);
		if (profile.image)
			formData.append('avatar', profile.image);

		protectedFetchFormData({
			token, deleteToken,
			url: '/profile', method: 'post',
			formData: formData,
			onSuccess: (data: Response)=>{
				if (data.status === 201)
				{
					state.name = profile.name
					setState({...state})
				}
				onSuccess(data)
			}
		})
	}
	function enable2fa() {
		state.otp_enable = true
		setState({...state})
	}

const value: UserContextValue = {
        content: state,
        token,
		deleteToken,
        login,
		updateProfile,
		enable2fa
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}