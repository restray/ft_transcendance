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
}): Promise<{data: any, ok: boolean, statusCode: number}> {

	var req = new Request(`http://localhost:3000${url}`, {
		method,
		body: JSON.stringify(body),
		headers: { ...HEADERS, 'Authorization': `Bearer ${token}`}
	})
	var statusCode = 400
	try {
		var response = await fetch(req)
		statusCode = response.status
		var data = await response.json()
	} catch(e: any) {
		return {
			data: null,
			ok: false,
			statusCode: statusCode
		}
	}

	if (data.statusCode === 401 && data.message === 'Unauthorized' && deleteToken) {
		deleteToken()
		return {
			data: data,
			ok: false,
			statusCode: statusCode
		}
	}
	if (callback)
		callback(data)
	return {
		data: data,
		ok: true,
		statusCode: statusCode
	}
}

export function checkToken(token: string | null | undefined, callback: (token: string)=>(void)) {
	if (token)
		callback(token)
}

export function protectedFetch({onSuccess, onFail, token, deleteToken, url, method, body}: {
	onSuccess?: (res: Response)=>void,
	onFail?: (err: any)=>void,
	token: string | null, deleteToken: ()=>void,
	url: string, method?: string, body?: object
}) {
	if (!token)
		return

	fetch(`http://localhost:3000${url}`, {
		method: method,
		headers: { ...HEADERS, 'Authorization': `Bearer ${token}`},
		body: JSON.stringify(body)
	})
	.then((res)=>{
		if (res.status === 401) {
			deleteToken()
			return
		}
		if (onSuccess) onSuccess(res)
	})
	.catch((err)=>{if(onFail) onFail(err)})
}

export function protectedFetchFormData({onSuccess, onFail, token, deleteToken, url, method, formData}: {
	onSuccess?: (res: Response)=>void,
	onFail?: (err: any)=>void,
	token: string | null, deleteToken: ()=>void,
	url: string, method?: string, formData?: FormData
}) {
	if (!token)
		return

	fetch(`http://localhost:3000${url}`, {
		method: method,
		headers: {
			'Accept': 'application/json',
			'Access-Control-Allow-Origin': '*',
			"Content-Type": "application/x-www-form-urlencoded",
			'Authorization': `Bearer ${token}`
		},
		body: formData
	})
	.then((res)=>{
		if (res.status === 401) {
			deleteToken()
			return
		}
		if (onSuccess) onSuccess(res)
	})
	.catch((err)=>{if(onFail) onFail(err)})
}