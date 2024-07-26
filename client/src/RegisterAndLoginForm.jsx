import React from 'react'
import { useState, useContext } from 'react'
import { UserContext } from './UserContext'
import axios from 'axios'

const RegisterAndLoginForm = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('login')

    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext)



    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLoginOrRegister === 'register' ? '/register' : '/login'
        try {
            console.log('hello')
            const { data } = await axios.post(url, { username, password })
            console.log(data)
            console.log(data)
            setLoggedInUsername(username)
            setId(data.id)
        } catch (error) {
            console.log(error.response.data)
            setErrorMessage(error.response.data.error)
            
        }

    };

    return (
        <>
            <div className='bg-blue-50 h-screen flex items-center text-xl'>
                <form className='w- mx-auto mb-12 flex-col align-center items-center' onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder='Username'
                        className='block w-full p-2 mb-4 border border-blue-50 rounded-md m-5'
                        value={username}
                        onChange={(e) => { setUsername(e.target.value) }}
                        autoComplete='true'
                    />
                        {errorMessage === 'User Not Found!!' && (
                            <div className = 'flex items-center gap-2 mx-5 my-0'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500">
                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                                </svg>
                        
                                <p className=' text-red-500 font-bold'>{errorMessage}</p>
                            </div>
                        )}


                    <input
                        type="password"
                        placeholder='Password'
                        className='block w-full p-2  border border-blue-50 rounded-md mx-5 my-1'
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }} />

                    {errorMessage === 'Password incorrect!' && (
                        <div className = 'flex items-center gap-2 mx-5 my-0'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500">
                                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                            </svg>

                            <p className=' text-red-500 font-bold'>{errorMessage}</p>
                        </div>
                    )}
                

                    <button className='w-full bg-blue-500 text-white block rounded-md mx-5 p-2 my-3'>
                        {isLoginOrRegister === 'login' ? 'Login' : 'Register'}
                    </button>

                    {isLoginOrRegister === 'register' && (
                        <div className='text-center w-full'>Already a member? &nbsp; &nbsp;
                            <button onClick={() => { setIsLoginOrRegister('login') }}>
                                Login here
                            </button>
                        </div>
                    )}

                    {isLoginOrRegister === 'login' && (
                        <div className='text-center m-5 mt-3 w-full'>Don't have account? &nbsp;
                            <button onClick={() => { setIsLoginOrRegister('register') }}>
                                Register
                            </button>
                        </div>
                    )}


                </form>
            </div>


        </>
    )
}

export default RegisterAndLoginForm