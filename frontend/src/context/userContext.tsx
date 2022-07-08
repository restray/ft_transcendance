import React, {createContext, useReducer, useCallback, useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import { NULL } from 'sass';
export const UserContext = createContext<UserContextValue | null>(null);

export interface UserContextValueState {

	name: string;
	image: string;
    token: string
}

export interface UserContextValue {

	content: UserContextValueState | null,
    login: (a: string, b: string, c: string)=>void
}

export const UserContextProvider = ( {children}: { children: JSX.Element} ) => {
    const [state, setState] = useState<UserContextValueState | null>(null)
	var [searchParams, setSearchParams] = useSearchParams()

    useEffect(()=>{
        var code = searchParams.get('code')
        if (code !== null)
        {
            fetch(`http://localhost:3000/auth/login?&code=${code}`, {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                method: 'GET'
            })
            .then( response => response.json() )
            .then( data => console.log(data) )
            .catch( error => console.log(error) )
            searchParams.delete('code')
            setSearchParams(searchParams)
        }
        else
        {
            document.location.href="https://api.intra.42.fr/oauth/authorize?client_id=26b634b716649363e01ab4a47f888a4f886a3dbd295b5db57140a068eda483bf&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2F&response_type=code"; 
        }
    }, [])
    //1 look at beartoken and delete it if invalid
    //2 else check if there is a code in url
    //3 redirection to intra

    function login(name: string, image: string, token: string) {
        setState({name, image, token})
    }

    const value: UserContextValue = {
        content: state,
        login: login
    }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}