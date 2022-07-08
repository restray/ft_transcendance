import { stringify } from 'querystring'
import { useSearchParams } from 'react-router-dom'

function acceptChatTag(value: string): boolean {
	return !(value !== 'chat' && value !== 'roomLocation'
	&& value !== 'roomId' && value !== 'p_msg')
}

export function sanitizeQuery(searchParams: URLSearchParams): URLSearchParams {

	searchParams.forEach((value: string, key: string)=>{
		if (acceptChatTag(key) === false && key !== 'name')
			searchParams.delete(key)
	})
	return searchParams
}

export function homeSanitizeQuery(searchParams: URLSearchParams): URLSearchParams {

	searchParams.forEach((value: string, key: string)=>{
		if (acceptChatTag(key) === false)
			searchParams.delete(key)
	})
	return searchParams
}
