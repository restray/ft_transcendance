import React, { ReactElement } from 'react'
import BigButton from './BigButton'

export default function ModalBox({ children, noTop }: {children: JSX.Element, noTop: boolean}) {

	return (
		<div className={`ModalBox ${noTop && 'ModalBox--noTop'}`}>
			{children}
			{/* <div className='ModalBox__title'>Random modal</div>
			<div className='ModalBox__content'>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent 
			ornare dignissim risus, vel vestibulum leo molestie id. Nulla ph
			aretra lectus nisi, pulvinar auctor ligula fringilla hendrerit. Integer eu fini
			bus leo. Integer tempor, dolor et condimentum tempus, augue tellus accumsan mass
			a, ac interdum risus tellus eget leo. Aenean auctor in urna ac ornare. Nulla vi
			tae nisl at nisi molestie vulputate et sed enim. Sed lacinia lorem nec odio hendr
			erit, in volutpat mi dignissim. Pellentesque placerat, eros ut ullamcorper preti
			um, turpis dolor tempus quam, sit amet faucibus purus ante eu odio. Vestibulum ante 
			ipsum primis in faucibus orci luctus et ultrices posuere c
			ubilia curae; Sed nec magna dolor. Duis sodales auctor elementum.
			</div>
			<div className='ModalBox__bottomBox'>button</div>
			<div className='ModalBox__bottomBox ModalBox__bottomBox--b'>button</div> */}
		</div>
	)
}
