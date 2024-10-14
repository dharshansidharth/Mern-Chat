import React from 'react'
import { useEffect, useState, useContext, useRef } from 'react'
import axios from 'axios'
import Avatar from './Avatar.jsx'
import Logo from './Logo.jsx'
import { UserContext } from './UserContext.jsx'
import { uniqBy } from 'lodash'
import Loader from './Loader.jsx'
import Contacts from './Contacts.jsx'

const Chat = () => {
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [offlinePeople, setOffliinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState('')
    const [messages, setMessages] = useState([])
    const { username, id, setUsername, setId } = useContext(UserContext)
    const divUnderMessages = useRef()

    useEffect(() => {
        connectToWs()
    }, [])

    useEffect(() => {
        if (divUnderMessages.current) {
            divUnderMessages.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data)

            })

        }
    }, [selectedUserId])

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                .filter(p => p.id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id))
            const offlinePeople = {}

            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p
            })

            setOffliinePeople(offlinePeople)
        })
    }, [onlinePeople])

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:5000')
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected, trying to connect...')
                connectToWs()
            }, 1000)
        })
    }


    function showOnlinePeople(peopleArray) {
        const people = {}
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username
        })
        setOnlinePeople(people)
    }


    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data)
        // console.log({e , messageData})
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        }
        else if('text' in messageData) {
            // console.log(messageData)
            if(messageData.sender === selectedUserId){
            setMessages(prev => ([...prev, { ...messageData }]))
            // console.log(messages);
            
            }
        }

    }

    const logout = () => {
        axios.post('/logout').then(() => {
            setWs(null)
            setUsername(null)
            setId(null)
        })

    }

    function sendMessage(e, file = null) {
        if (e) { e.preventDefault() }

        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,
        }))

        
            if (file) {
                axios.get('/messages/' + selectedUserId).then(res => {
                    setMessages(res.data)

                })
            }
            else{
                if (newMessageText) {
                    setNewMessageText('')
                    setMessages(prev => ([...prev, {
                        text: newMessageText,
                        isOur: true,
                        sender: id,
                        recipient: selectedUserId,
                        _id: Date.now()
                    }]))
            }
            
            

        }
    }

    function sendFile(e) {
        const reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onload = () => {
            sendMessage(null, {
                name: e.target.files[0].name,
                data: reader.result,
            })
        }

        // console.log(e.target.files) 

    }

    const otherOnlinePeople = { ...onlinePeople }
    delete otherOnlinePeople[id]

    const uniqueMessages = uniqBy(messages, '_id')

    // console.log(onlinePeople)


    return (
        <>
            <div className="h-screen flex">
                <div id='contacts' className='w-1/3 h-screen bg-blue-100 overflow-y-scroll flex flex-col'>
                    <div className='flex-grow'>
                        <Logo />

                        <div className='mx-3 my-2 '>
                            {Object.keys(otherOnlinePeople).map(userId => (
                                <Contacts key={userId}
                                    id={userId}
                                    online={true}
                                    username={otherOnlinePeople[userId]}
                                    onClick={() => setSelectedUserId(userId)}
                                    selected={userId === selectedUserId}
                                />
                            ))}
                            {Object.keys(offlinePeople).map(userId => (
                                <Contacts key={userId}
                                    id={userId}
                                    online={false}
                                    username={offlinePeople[userId].username}
                                    onClick={() => setSelectedUserId(userId)}
                                    selected={userId === selectedUserId}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='flex justify-between'>
                        <div className='flex justify-center items-center text-lg text-sky-900'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 ml-2 text-blue-900">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                            </svg>


                            <span className='my-2 ml-2 font-semibold text-lg'>{username}</span>
                        </div>
                        <div className='flex items-center'>

                            <button onClick={logout} className='mx-3 bg-red-500 py-2 px-4 my-3 text-white rounded-md'>Logout</button>
                        </div>
                    </div>

                </div>
                <div id='message' className='w-2/3 bg-blue-200 flex flex-col '>
                    <div className='flex flex-grow'>
                        {!selectedUserId && (
                            <div className='mx-auto my-auto text-4xl text-gray-400'>
                                &larr;Select contacts to start conversation
                            </div>
                        )}

                        {selectedUserId && (
                            <div className='w-full h-full relative pb-4'>
                                <div className='w-full overflow-y-scroll absolute inset-0'>
                                    {uniqueMessages.map((message, index) => (
                                        <div key={index} className={message.sender === id ? 'text-right' : 'text-left'}>
                                            <div className={'max-w-width-half min-w-1 text-xl text-left inline-block py-2 px-3 m-5 rounded-lg ' + (message.sender === id ? 'bg-blue-500 text-white ' : 'bg-gray-400 text-gray-700')}>
                                                {message.text}

                                                {message.file && (
                                                    <div className='flex items-center gap-2'>
                                                        <a target='_blank' className='underline' href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 bg-blue-500 text-white ">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                                            </svg>
                                                            {message.file}
                                                        </a>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    ))}
                                    <div ref={divUnderMessages}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedUserId && (
                        <form className='flex gap-2 items-center' onSubmit={sendMessage}>
                            <input type="text" onChange={(e) => {
                                setNewMessageText(e.target.value)
                            }}
                                placeholder={'Type your message here'}
                                value={newMessageText}
                                className='bg-white border p-2 flex-grow ml-2 my-3' />

                            <label type='button' className='bg-gray-400 text-gray-600 p-2  my-3'>
                                <input type="file" className='hidden' onChange={(e) => { sendFile(e) }} />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                </svg>

                            </label>

                            <button className='bg-blue-500 text-white p-2 mr-2 my-3' type='submit'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </>
    )
}

export default Chat