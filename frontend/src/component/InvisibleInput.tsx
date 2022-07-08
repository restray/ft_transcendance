import React, {ChangeEvent, ChangeEventHandler, useRef, useState} from 'react'

export function InvisibleInputSelect({name, choices, isLock=false, setSelected, selected }:
{name: string, choices: string[], isLock?: boolean, setSelected: (arg0: string)=>void, selected: string}) {

	const [isFocus, setIsFocus] = useState<boolean>(false)

	function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setSelected(e.target.value)
	}

	return (
		<div className='InvisibleInput'>
			<span className='InvisibleInput__title'>{name}</span>
			<div className='InvisibleInput__container'>
				{(isFocus) && <div className='InvisibleInput--bg'></div>}
				{(isLock) && <div className='InvisibleInput--lock'></div>}
				<select
				className='InvisibleInput__input'
				onFocus={()=>setIsFocus(true)}
				onBlur={()=>setIsFocus(false)}
				onChange={onChange}
				value={selected}
				>
					{choices.map((opt: string)=><option key={opt} value={opt}>{opt}</option>)}
				</select>
			</div>
		</div>
	)
}
export default function InvisibleInput({name, value, setValue, isLock=false}
: {name: string, value: string, setValue: (value: string)=>void, isLock?: boolean}) {

	const [isFocus, setIsFocus] = useState<boolean>(false)

	function onChange(e: ChangeEvent<HTMLInputElement>) {
		setValue(e.target.value)
	}

	return (
		<div className='InvisibleInput'>
			<span className='InvisibleInput__title'>{name}</span>
			<div className='InvisibleInput__container'>
				{(isFocus) && <div className='InvisibleInput--bg'></div>}
				{(isLock) && <div className='InvisibleInput--lock'></div>}
				<input
				className='InvisibleInput__input'
				onFocus={()=>setIsFocus(true)}
				onBlur={()=>setIsFocus(false)}
				value={value}
				onChange={onChange}
				/>
			</div>
		</div>
	)
}