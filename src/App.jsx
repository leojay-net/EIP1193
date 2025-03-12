import { useState } from 'react'
import './App.css'
import WalletManagement from './components'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <WalletManagement />
    </>
  )
}

export default App
