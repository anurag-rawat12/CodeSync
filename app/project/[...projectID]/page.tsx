
import MonacoEditor from '@/components/MonacoEditor'
import React from 'react'
import { Room } from '@/components/Room'

const page = () => {

  return (
    <div>
      <Room>
        <MonacoEditor />
      </Room>

    </div>
  )
}

export default page
