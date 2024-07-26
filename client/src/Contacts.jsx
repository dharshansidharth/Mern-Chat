import React from 'react'
import Avatar from './Avatar.jsx'

const Contacts = ({id , username , onClick , selected , online}) => {
    return (
        <>
            <div key={id} className={'z-10 border-b border-gray-400 flex items-center text-gray-700 cursor-pointer rounded-lg  ' + (selected ? 'bg-blue-200' : '')} onClick={() => {
                onClick(id)

            }}>
                {selected && (
                    <div className='w-1 h-14 bg-blue-700 rounded-l-lg'></div>
                )}

                <div className='flex items-center justify-center text-nowrap'>
                    <Avatar online={online} username={username} userId={id} />
                    <span>
                        {username}
                    </span>
                </div>

            </div>
        </>
    )
}

export default Contacts