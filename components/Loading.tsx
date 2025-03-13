import { Loader } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className='flex flex-col text-gray-400 items-center justify-center'>
        <Loader id='spinner' />
    </div>
  )
}

export default Loading
