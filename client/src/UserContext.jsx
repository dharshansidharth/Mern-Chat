import React from 'react'   
import { createContext , useState , useEffect } from 'react'
import axios from 'axios'


export const UserContext = createContext({})

export const UserContextProvider = ({children}) => {

    const [username , setUsername] = useState(null)
    const [id , setId] = useState(null)

    useEffect(() => {
      axios.get('/profile')
        .then(response => {
          setId(response.data.userId)
          setUsername(response.data.username) 
        })
        .catch(error => {
          console.error('Error fetching profile data:', error);
        });
    }, []);
    

  return (
    <>
        <UserContext.Provider value = {{username , setUsername , id , setId}}>
            {children}
        </UserContext.Provider>
    </>
  )
}

// export default UserContextProvider