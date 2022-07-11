import _ from 'lodash'
import React, {useContext, useEffect, useRef, useState} from 'react'
import ImageUploader from '../component/ImageUploader'
import InvisibleInput, { InvisibleInputSelect } from '../component/InvisibleInput'
import SaveBox, { ErrorBox } from '../component/SaveBox'
import { ConnectedUser, User } from '../context/chatContext'
import { UserContext, UserContextValue } from '../context/userContext'

export interface ConnectedUserWithImg extends ConnectedUser {
	image: null | any
}

export default function Settings() {
	
	const {content, updateProfile} = useContext(UserContext) as UserContextValue
	const [user, setUser] = useState<ConnectedUserWithImg>({name:'',avatar:'',id:0,otp_enable:false,
	image:null})
	const [twoFactors, setTwoFactors] = useState<string>('Disable')
	const [modified, setModified] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<boolean>(false)
	
	useEffect(()=>{
		setLoading(false)
		reset()
	}, [content])

	useEffect(()=>{
		reset()
		setTwoFactors(content.otp_enable ? 'Enable' : 'Disable')
	}, [])

	function reset() {
		setUser({...content, image: null})
	}

	/* udapters */
	function setImage(image: any) {
		user.image = image
		setUser({...user})
	}
	function resetImage() {
		user.image = null
		setUser({...user})
	}
	function setUserName(name: string) {
		user.name = name
		setUser({...user})
	}
	function setTwoFactorsEvent(value: string) {
		setTwoFactors(value)
		if (value === 'Enable')
			user.otp_enable = true
		else
			user.otp_enable = false
		setUser({...user})
	}
	/* end udapters */

	useEffect(() => {

		if (_.isEqual({...content, image: null}, user) === false)
			setModified(true)
		else
			setModified(false)
	}, [user])

	function updateProfileEvent() {

		updateProfile(user, (data: Response)=>{
			if (data.status !== 201)
				setError(true)
			else
				setError(false)
			setLoading(false)
		})
	}

	return (
		<div className={'ProfilPage'} style={{'backgroundColor': 'black', color: 'white'}}>
			<div className={'ProfilPage__title'}>Settings</div>
			{loading ?
			<p>loading...</p>
			:
			<>
			<div className='ChannelParameter__image'>
				<img
				alt="not fount"
				src={user.image ? URL.createObjectURL(user.image)
				: content.avatar}
				onError={resetImage}
				/>
				<ImageUploader setSelectedImage={setImage}/>
			</div>
			<InvisibleInput name={'User name'} value={user.name} setValue={setUserName}/>
			<InvisibleInputSelect name={'Enable two factors'} choices={[
					'Enable',
					'Disable'
			]} setSelected={setTwoFactorsEvent} selected={twoFactors}/>
			
			{modified && <SaveBox onReset={reset} onSave={updateProfileEvent}/>}
			{error && <ErrorBox/>}
			</>
			}
		</div>
	)
}