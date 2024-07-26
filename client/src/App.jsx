import Routes from './Routes'
import axios from 'axios'
import { UserContextProvider } from './UserContext.jsx'
import Chat from './Chat.jsx'


function App() {
  axios.defaults.baseURL = 'http://localhost:5000'
  axios.defaults.withCredentials = true

  
  return (
    <>
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
    </>
      )
}

      export default App
