import { Loader } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className='flex flex-col h-[100%] w-[100%] text-gray-400 items-center justify-center'>
        <Loader id='spinner' />
    </div>
  )
}

export default Loading
