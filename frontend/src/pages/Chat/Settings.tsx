import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import _ from 'lodash'
import InvisibleInput, { InvisibleInputSelect } from "../../component/InvisibleInput"
import ImageUploader from "../../component/ImageUploader"
import Listing from "../../component/Listing"
import SaveBox from "../../component/SaveBox"
import cross from '../../images/cross.svg'
import Modal from "../../component/Modal"

type ServerProtection = 'Private' | 'Protected' | 'Public'

interface RoomOpt {
	image: any | string,
	name: string,
	serverProtection: string,
	pass: string,
	admin: string[],
	muted: string[],
	banned: string[]
}

function SaveProtection({modal, setModal, onQuit, onSave}
: {modal: boolean, setModal: (a: boolean)=>void, onQuit: ()=>void, onSave: ()=>void}) {

	function close() {
		setModal(false)
	}
	return (
		<Modal open={modal} setOpen={setModal}>
			<div className='ModalBox' style={{overflow:'unset'}}>
				<div className='ModalBox__title'>Are you sure to quit without saving?</div>
				<div className='ModalBox__bottomBox ModalBox__bottomBox' onClick={onSave}>Save</div>
				<div className='ModalBox__bottomBox ModalBox__bottomBox--b' onClick={onQuit}>Leave</div>
			</div>
		</Modal>
	)
}

export function ChannelParameter() {

	const [global, setGlobal] = useState<RoomOpt>({
		image: 'https://pierreevl.vercel.app/image/logo.jpg',
		name: 'Super name for room',
		serverProtection: 'Public',
		pass: '',
		admin: ['pleveque0', 'pleveque1', 'pleveque2'],
		muted: ['pleveque0', 'pleveque1', 'pleveque2'],
		banned: ['pleveque0', 'pleveque1', 'pleveque2']
	})
	const [local, setLocal] = useState<RoomOpt>({image: '', name: '',serverProtection: 'Private',pass: '',admin: [],muted: [],banned: []})
	const [modified, setModified] = useState<boolean>(false)
	useEffect(() => {setLocal(Object.assign({}, global))}, [global])
	var [searchParams, setSearchParams] = useSearchParams()

	const [modal, setModal] = useState<boolean>(false)

	function close() {
		if (modified)
			setModal(true)
		else
			goHome()
	}

	function onSave() {
		goHome()
	}

	function goHome() {
		searchParams.set('roomLocation', 'room/home')
		setSearchParams(searchParams, {replace: true})
	}

	/*update local */
	function setImage(image: any) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.image = image
		setLocal(newLocal)
	}
	function resetImage() {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.image = global.image
		setLocal(newLocal)
	}
	function setServerProtection(value: string) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.serverProtection = value
		setLocal(newLocal)
	}
	function setAdmin(admins: string[]) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.admin = admins
		setLocal(newLocal)
	}
	function setMuted(muteds: string[]) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.muted = muteds
		setLocal(newLocal)
	}
	function setBanned(banneds: string[]) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.banned = banneds
		setLocal(newLocal)
	}
	function setRoomName(name: string) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.name = name
		setLocal(newLocal)
	}
	function setRoomPass(pass: string) {
		var newLocal: RoomOpt = Object.assign({}, local);
		newLocal.pass = pass
		setLocal(newLocal)
	}
	/*update local */

	function compareState() {
		if (_.isEqual(local, global) === false)
			setModified(true)
		else
			setModified(false)
	}

	function reset() {
		setLocal(Object.assign({}, global))
	}

	useEffect(() => {
		compareState()
	}, [local])

	return (
		<div className='ChannelParameter--container'>
			<SaveProtection modal={modal} setModal={setModal} onSave={onSave} onQuit={goHome}/>
			<div className='ChannelParameter'>
				<img onClick={close} src={cross} className='ChannelParameter__cross' alt='' />
				<div className='ChannelParameter__image'>
					<img
					alt="not fount"
					src={typeof(local.image) === 'string' ? local.image
					: URL.createObjectURL(local.image)}
					onError={resetImage}
					/>
					<ImageUploader setSelectedImage={setImage}/>
				</div>
				<InvisibleInput name={'Room name'} value={local.name} setValue={setRoomName}/>
				<InvisibleInputSelect name={'Server protection'} choices={[
					'Private',
					'Protected',
					'Public'
				]} setSelected={setServerProtection} selected={local.serverProtection}/>
				<InvisibleInput name={'Pass for room'} isLock={local.serverProtection !== 'Protected'}
				value={local.pass} setValue={setRoomPass}/>
				<Listing name={'Admins'} data={local.admin} setData={setAdmin}/>
				<Listing name={'Muted'} data={local.muted} setData={setMuted}/>
				<Listing name={'Banned'} data={local.banned} setData={setBanned}/>
				{modified && <SaveBox onReset={reset} onSave={()=>console.log('send')}/>}
			</div>
		</div>
	)
}