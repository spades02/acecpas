import LeftPanel from '@/components/pages/auth/left-panel'
import SignUpForm from '@/components/pages/auth/signup/signup-form'
import React from 'react'

function SigupPage() {
  return (
    <div className="grid grid-cols-[auto_38rem] justify-stretch min-h-screen w-full">
        {/* {Left Panel - Marketing} */}
        <LeftPanel/>
        {/* {Right Panel - Signup Form} */}
        <SignUpForm />
    </div>
  )
}

export default SigupPage