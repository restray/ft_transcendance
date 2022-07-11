import _ from 'lodash'
import React, {useContext, useEffect, useRef, useState} from 'react'
import ImageUploader from '../component/ImageUploader'
import InvisibleInput, { InvisibleInputSelect } from '../component/InvisibleInput'
import SaveBox from '../component/SaveBox'
import { ConnectedUser, User } from '../context/chatContext'
import { UserContext, UserContextValue } from '../context/userContext'

interface ConnectedUserWithImg extends ConnectedUser {
	image: null | any
}

export default function Settings() {
	
	const {content} = useContext(UserContext) as UserContextValue
	const [user, setUser] = useState<ConnectedUserWithImg>({name:'',avatar:'',id:0,otp_enable:false,
	image:''})
	const [twoFactors, setTwoFactors] = useState<string>('Disable')
	const [modified, setModified] = useState<boolean>(false)

	useEffect(()=>{
		reset()
		setTwoFactors(content.otp_enable ? 'Enable' : 'Disable')
	}, [])

	function reset() {
		setUser({...content, image: 'https://pierreevl.vercel.app/image/logo.jpg'})
	}

	/* udapters */
	function setImage(image: any) {
		user.image = image
		setUser({...user})
	}
	function resetImage() {
		user.image = 'https://pierreevl.vercel.app/image/logo.jpg'
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

		if (_.isEqual({...content, image: content.avatar}, user) === false)
			setModified(true)
		else
			setModified(false)

	}, [user])

	return (
		<div className={'ProfilPage'} style={{'backgroundColor': 'black', color: 'white'}}>
			<div className={'ProfilPage__title'}>Settings</div>
			<div className='ChannelParameter__image'>
				<img
				alt="not fount"
				src={typeof(user.image) === 'string' ? user.image
				: URL.createObjectURL(user.image)}
				onError={resetImage}
				/>
				<ImageUploader setSelectedImage={setImage}/>
			</div>
			<InvisibleInput name={'User name'} value={user.name} setValue={setUserName}/>
			<InvisibleInputSelect name={'Enable two factors'} choices={[
					'Enable',
					'Disable'
			]} setSelected={setTwoFactorsEvent} selected={twoFactors}/>
			
			{modified && <SaveBox onReset={reset} onSave={()=>console.log('send')}/>}
		</div>
	)
}