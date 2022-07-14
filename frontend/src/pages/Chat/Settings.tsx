import { useContext, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import _ from 'lodash'
import InvisibleInput, { InvisibleInputSelect } from "../../component/InvisibleInput"
import ImageUploader from "../../component/ImageUploader"
import Listing from "../../component/Listing"
import SaveBox from "../../component/SaveBox"
import cross from '../../images/cross.svg'
import Modal from "../../component/Modal"
import { ChatContext, ChatValue, RoomUser } from "../../context/chatContext"
import { CreateServerModal } from "./AllChannel"
import { UserContext, UserContextValue } from "../../context/userContext"
import bin from '../../images/bin.svg'

type ServerProtection = 'Private' | 'Protected' | 'Public'

interface RoomOpt {
	image: any | string,
	name: string,
	serverProtection: string,
	pass: string,
	admin: RoomUser[],
	muted: RoomUser[],
	banned: RoomUser[]
}

function SaveProtection({modal, setModal, onQuit, onSave}
: {modal: boolean, setModal: (a: boolean)=>void, onQuit: ()=>void, onSave: ()=>void}) {

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
		name: '',
		serverProtection: '',
		pass: '',
		admin: [],
		muted: [],
		banned: []
	})
	const [local, setLocal] = useState<RoomOpt>({image: '', name: '',serverProtection: 'Private',pass: '',admin: [],muted: [],banned: []})
	const [modified, setModified] = useState<boolean>(false)
	const {setLocation, content: {rData}, deleteChannel} = useContext(ChatContext) as ChatValue
	const {content: cUser} = useContext(UserContext) as UserContextValue

	useEffect(() => {

		if (!rData)
			return
		global.name = rData.name
		global.serverProtection = rData.type
		global.admin = rData.users.filter((user: RoomUser)=> user.state === 'ADMIN' && user.user.id !== cUser.id)
		global.muted = rData.users.filter((user: RoomUser)=> user.state === 'MUTE')
		global.banned = rData.users.filter((user: RoomUser)=> user.state === 'BAN')
		setGlobal({...global})
	},
	[rData])

	useEffect(() => {
		setLocal({...global})
	},
	[global])

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
		setLocation('room/home', rData?.id)
	}

	/*update local */
	function setImage(image: any) {
		local.image = image
		setLocal({...local})
	}
	function resetImage() {
		local.image = global.image
		setLocal({...local})
	}
	function setServerProtection(value: string) {
		local.serverProtection = value
		setLocal({...local})
	}
	function setAdmin(admins: RoomUser[]) {
		local.admin = admins
		setLocal({...local})
	}
	function setMuted(muteds: RoomUser[]) {
		local.muted = muteds
		setLocal({...local})
	}
	function setBanned(banneds: RoomUser[]) {
		local.banned = banneds
		setLocal({...local})
	}
	function setRoomName(name: string) {
		local.name = name
		setLocal({...local})
	}
	function setRoomPass(pass: string) {
		local.pass = pass
		setLocal({...local})
	}
	/*update local */

	function reset() {
		setLocal(Object.assign({}, global))
	}

	useEffect(() => {

		if (_.isEqual(local, global) === false)
			setModified(true)
		else
			setModified(false)

	}, [local, global])

	/* delete channel + modal */
	const [deleteModal, setDeleteModal] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(()=>{
		if (deleteModal === false)
			setError(null)		
	}, [deleteModal, setError])

	function eventDeleteChannel() {
		if (!rData)
			return
		setIsLoading(true)
		deleteChannel(rData.id, (statusCode: number, statusText: string)=>{
			setIsLoading(false)
			if (statusCode !== 200)
				setError(statusText)
			else {
				setDeleteModal(false)
			}
		})
	}
	function openDeleteModal() {
		setDeleteModal(true)
	}
	/* delete channel */

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

				<div onClick={openDeleteModal} className='ChannelParameter__deleteChannel'>
					DELETE CHANNEL
					<img src={bin} alt=''/>
				</div>
				<CreateServerModal modal={deleteModal} setModal={setDeleteModal}
				isLoading={isLoading} error={error}
				onCreate={eventDeleteChannel} message={`Do you really want to delete "${rData?.name}"?`}
				title={'Leave room'} />

				{modified && <SaveBox onReset={reset} onSave={()=>console.log('send')}/>}
			</div>
		</div>
	)
}