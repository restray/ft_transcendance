import React, { useState, useRef } from 'react'

export default function ImageUploader({setSelectedImage}: {setSelectedImage: (image: any)=>void}) {
	// const [selectedImage, setSelectedImage] = useState<any | null>(null);
	const dlRef = useRef<HTMLInputElement>(null)

	function openForm() {
		if (dlRef.current)
			dlRef.current.click()
	}
	return (
		<div className='ImageUploader' onClick={openForm}>
			Upload Image
			<input
			type="file"
			onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
				if ( event.target.files && event.target.files.length && event.target.files[0] )
					setSelectedImage(event.target.files[0]);
			}}
			ref={dlRef}
			/>
		</div>
	)
}
