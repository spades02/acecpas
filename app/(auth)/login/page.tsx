import LeftPanel from '@/components/pages/auth/left-panel'
import LoginForm from '@/components/pages/auth/login/login-form'

function LoginPage() {
    return (
      <div className="grid grid-cols-[auto_38rem] justify-stretch min-h-screen w-full">
        {/* Left Panel - Marketing */}
        <LeftPanel />
        {/* Right Panel - Login Form */}
        <LoginForm />
      </div>
    )
  }

export default LoginPage