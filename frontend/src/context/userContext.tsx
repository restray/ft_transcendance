import React, {createContext, useState, useEffect, useCallback} from 'react';
import { useSearchParams } from 'react-router-dom';
import { BACKEND_HOSTNAME } from '../envir';
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
	tempToken: string | null,
	deleteToken: ()=>void,
    login: ()=>void,
	updateProfile: (profile: ConnectedUserWithImg, onSuccess: (data: any)=>void)=>void,
	enable2fa: (code: string, onSuccess: (res: Response)=>void)=>void,
	devLogin: (tok:string)=>void,
	loading: boolean,
	validate2fa: (code: string, setError?: (a: boolean)=>void)=>void
}

export const UserContextProvider = ( {children}: { children: JSX.Element} ) => {
	const initState: ConnectedUser = {name:'',avatar:'', id: 0, otp_enable: false}

    const [state, setState] = useState<ConnectedUser>(initState)
    const [token, setToken] = useState<string | null>(null)
    const [tempToken, setTempToken] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
	var [searchParams, setSearchParams] = useSearchParams()

	const deleteToken = useCallback(
		function deleteToken() {
		if(!token)
			return
		setToken(null)
		setTempToken(null)
		localStorage.removeItem('userToken')
		setState({name:'',avatar:'',id:0, otp_enable: false})
	}, [token, setToken])

	useEffect(()=>{
		if (!token)
			return

		protectedFetch({
			token,
			deleteToken: ()=>{setLoading(false); deleteToken()},
			url: `/profile`, method: 'GET',
			onSuccess: (res: Response)=>{
				if (res.status === 200) {
					res.json().then((data: any)=>{
						setState({
							name: data.name,
							avatar: `${data.avatar}`,
							id: data.id,
							otp_enable: data.otp_enable
						})
						if (token)
							localStorage.setItem('userToken', token)
			 			setLoading(false)
					})
				}
				else
					setLoading(false)
			}
		})
	}, [token, deleteToken])

	function validate2fa(code: string, setError?: (a: boolean)=>void) {
		setLoading(true)
		fetch(`${BACKEND_HOSTNAME}/auth/2fa/authenticate`, {
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'Accept': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({code}),
			method: 'POST'
		})
		.then((res: Response) => {
			if (res.status === 201)
			{
				setToken(tempToken)
				setTempToken(null)
				if (setError) setError(false)
			}
			else
				if (setError) setError(true)
			setLoading(false)
		}).catch(()=>{
			setLoading(false)
			if (setError) setError(true)
		})
	}

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
			setLoading(true)
			console.log(`login with ${code}`)
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
					if (data['2fa_needed'])
					{
						setTempToken(data.access_token)
						setLoading(false)
					}
					else
						setToken(data.access_token)
				}
				else 
					setLoading(false)
			})
			.catch(()=>{
				setLoading(false)
			})
		}
		searchParams.delete('code')
		setSearchParams(searchParams)
    }, [searchParams, setSearchParams])

	function login() {
		document.location.href="https://api.intra.42.fr/oauth/authorize?client_id=26b634b716649363e01ab4a47f888a4f886a3dbd295b5db57140a068eda483bf&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2F&response_type=code"; 
	}

	function devLogin(tok: string) {
		setToken(tok)
	}

	async function updateProfile(profile: ConnectedUserWithImg, onSuccess: (data: any)=>void) {

		var formData: FormData = new FormData()
		formData.append('name', profile.name)
		if (profile.image)
			formData.append('avatar', profile.image)

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
	function enable2fa(code: string, onSuccess: (res: Response)=>void) {
		protectedFetch({token, deleteToken,
			url: '/auth/2fa/enable', method: 'POST',
			body: {code: code},
			onSuccess: (res: Response)=>{
				if (res.status === 201)
				{
					state.otp_enable = true
					setState({...state})
				}
				onSuccess(res)
			}
		})
	}

const value: UserContextValue = {
        content: state,
        token,
		tempToken,
		deleteToken,
        login,
		updateProfile,
		enable2fa,
		devLogin,
		loading,
		validate2fa
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}