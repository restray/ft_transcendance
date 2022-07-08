import React from 'react'

export default function BigButton({ name } : { name: string }) {
  return (
    <div className={'BigButton'}>{name}</div>
  )
}
