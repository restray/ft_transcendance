import React from 'react'

export default function SaveBox({onReset, onSave}: {onReset: ()=>void, onSave: ()=>void}) {
	return (
		<div className='SaveBox'>
			<div className='SaveBox--bg'></div>
			<p>Care, there is unsave modifications!</p>
			<div className='SaveBox__buttons'>
				<button onClick={onReset}>Reset</button>
				<button onClick={onSave}>Save modifications</button>
			</div>
		</div>
	)
}
