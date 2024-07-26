import React from 'react'
import RegisterAndLoginForm from './RegisterAndLoginForm.jsx'
import { useContext } from 'react'
import { UserContext } from './UserContext.jsx'
import Chat from './Chat.jsx'

const Routes = () => {

    const {username , id} = useContext(UserContext)

      if(username){
        // console.log('logged in successfully')
        return <Chat />

      }
    

  return (
    <RegisterAndLoginForm />
  )
}

export default Routes