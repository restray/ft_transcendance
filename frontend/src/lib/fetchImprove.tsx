import { method } from "lodash"
import { HEADERS } from ".."

interface ErrorHttp {
	statusCode: number,
	message: string
}

export default async function fetchWithToken<T>({token, deleteToken, url, body, method, callback}
:{token: string, url: string,
deleteToken?: ()=>void,
body?: object | undefined, method?: string | undefined,
callback?: (a: T)=>(void) | undefined
}): Promise<T> {

	var req = new Request(`http://localhost:3000${url}`, {
		method,
		body: JSON.stringify(body),
		headers: { ...HEADERS, 'Authorization': `Bearer ${token}`}
	})
	var response = await fetch(req)
	var data = await response.json()
	if (data.statusCode === 401 && deleteToken) {
		deleteToken()
		return data
	}
	if (callback)
		callback(data)
	return data
}

export function checkToken(token: string | null | undefined, callback: (token: string)=>(void)) {
	if (token)
		callback(token)
}