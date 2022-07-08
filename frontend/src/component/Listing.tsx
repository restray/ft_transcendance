import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import menu from '../images/menu.svg'
import bin from '../images/bin.svg'

export default function Listing({name, data, setData}:
{name: string, data: string[], setData: (arg0: string[])=>(void)}) {

	const [expanded, setExpanded] = useState<boolean>(false)
	const [selected, setSelected] = useState<number[]>([])
	const [selectallChecked, setSelectallChecked] = useState<boolean>(false)

	function selectAll(e: React.ChangeEvent<HTMLInputElement>) {
		e.stopPropagation()
		if (selectallChecked === false) {
			var newSelected: number[] = []
			for (var i = 0; i < data.length; ++i)
				newSelected.push(i)
			setSelected([...newSelected])
			setSelectallChecked(true)
		}
		else {
			setSelectallChecked(false)
			setSelected([])
		}
	}

	function selectSelf(elem: number) {
		var newArr: number[] = selected
		if (selected.includes(elem)) {
			newArr = newArr.filter((value: number): boolean=>{ 
				return (value !== elem)
			})
		}
		else {
			newArr=[...selected, elem]
		}
		setSelected([...newArr])
		if (selectallChecked === true)
			setSelectallChecked(false)
	}

	function deleteSelf(elem: number) {
		var newArr: string[] = data
		newArr = newArr.filter((value: string, index: number): boolean=>{ 
			return (index !== elem)
		})
		setSelectallChecked(false)
		var newSelected: number[] = selected
		newSelected = newSelected.filter((value: number): boolean=>{ 
			return (elem !== value)
		})
		setSelected(newSelected)
		setData(newArr)
	}

	function deleteSelected() {
		var newArr: string[] = data
		newArr = newArr.filter((value: string, index: number): boolean=>{ 
			return !selected.includes(index)
		})
		setSelectallChecked(false)
		setSelected([])
		setData(newArr)
	}

	return (
		<div className='Listing'>
			<div className='Listing__name' onClick={()=>{setExpanded(!expanded)}}>
				{name}
				<div className='Listing__name__images'>
					{expanded &&
					<>
						<motion.input initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scaleY:0, height: 0 }}
						type="checkbox" className='Listing__name__checkbox'
						onChange={(e)=>selectAll(e)}
						checked={selectallChecked}
						onClick={(e)=>e.stopPropagation()}
						/>
						<motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
						src={bin} alt=''
						onClick={(e)=>{
							e.stopPropagation()
							deleteSelected()
						}}
						/>
					</>
					}
					<img src={menu} alt='' />
				</div>
			</div>
			<AnimatePresence>
				{expanded &&
					<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					exit={{ scaleY:0, height: 0 }}
					style={{ transformOrigin: 'top center' }}
					>
						{data.map((elem: string, index: number)=> 
						<div key={index} className='Listing__element' onClick={()=>selectSelf(index)}>
							{elem}
							<div className='Listing__name__images'>
								<input 
								type="checkbox" 
								className='Listing__name__checkbox'
								checked={selected.includes(index)}
								onChange={()=>selectSelf(index)}
								/>
								<img src={bin} alt=''
								onClick={(e)=>{
									e.stopPropagation()
									deleteSelf(index)
								}}
								/>	
							</div>
						</div>)
						}
					</motion.div>
				}
			</AnimatePresence>
		</div>
	)
}
