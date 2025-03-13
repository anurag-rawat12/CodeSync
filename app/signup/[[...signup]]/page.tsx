'use client'
import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className='text-white bg-black flex justify-center items-center min-h-[100vh]'>
        <SignUp></SignUp>
    </div>
  )
}

export default page
