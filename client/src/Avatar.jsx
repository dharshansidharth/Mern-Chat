import React from 'react'

const Avatar = ({ username, userId, online }) => {
  const colors = ['bg-red-300', 'bg-green-300', 'bg-purple-300', 'bg-blue-300', 'bg-fuchsia-300', 'bg-teal-300']
  const userIdBase10 = parseInt(userId, 16)
  const colorIndex = userIdBase10 % colors.length
  const color = colors[colorIndex]



  return (
    <div className={'relative h-8 w-8 rounded-full m-3  font-semibold text-lg  ' + color}>
      <div className='text-center flex items-center justify-center'>{username[0]}</div>
      {online && (
        <div className=' w-3 h-3 absolute bottom-0 right-0 rounded-full bg-green-500 border border-zinc-200 shadow-lg shadow-black'></div>
      )}
      {!online && (
        <div className=' w-3 h-3 absolute bottom-0 right-0 rounded-full bg-gray-500 border border-zinc-200 shadow-lg shadow-black'></div>
      )}
    </div>
  )
}

export default Avatar