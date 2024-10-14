const express = require('express')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const user = require('./models/User.js')
const Messages = require('./models/Messages.js')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const ws = require('ws')
const fs = require('fs')

const app = express()
const url = process.env.MONGO_URL
const bcryptSalt = bcrypt.genSaltSync(10)



app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))

try {
    mongoose.connect(url)
    console.log('connected to mongodb')
}
catch (err) {
    console.log('connection error')
    throw err
}

app.use(express.json())
app.use(cookieParser())
app.use('/uploads' , express.static(__dirname + '/uploads'))

const port = process.env.port || 5000
const jwtSecret = process.env.JWT_SECRET

app.get('/test', (req, res) => {
    res.json('test ok')
})

const getUserDataFromRequest = (req) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) {
                    console.error('JWT verification error:', err);
                    return res.status(403).json('Invalid token');
                }
                resolve(userData)
            });
        } else {
            reject('no token')
        }
    })
}



app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) {
                console.error('JWT verification error:', err);
                return res.status(403).json('Invalid token');
            }
            res.json(userData);
        });
    } else {
        res.status(401).json('No token');
    }
});



app.post('/login', async (req, res) => {  
    const { username, password } = req.body
    const foundUser = await user.findOne({ username })

    if (foundUser) {
        const passwordOk = bcrypt.compareSync(password, foundUser.password)

        if (passwordOk) {

            jwt.sign({ userId: foundUser._id, username , passwordStatus: false}, jwtSecret, {}, (err, token) => {
                if (err) { throw err }

                res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                    id: foundUser._id
                })
            })

        }
        else {
            res.status(401).json({
                error : 'Password incorrect!'
            })
        }
    }
    else {
        res.status(401).json({error: 'User Not Found!!'})
    }
})

app.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params
    const userData = await getUserDataFromRequest(req)
    const ourUserId = userData.userId
    const messages = await Messages.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] }
    }).sort({ createdAt: 1 }).exec()
    res.json(messages)
})

app.get('/people', async (req, res) => {
    const registeredPeople = await user.find({}, { '_id': 1, 'username': 1 })
    res.json(registeredPeople)
})

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt)

        const createdUser = await user.create({ username: username, password: hashedPassword })
        // console.log(createdUser)
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err) { throw err }
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                id: createdUser._id
            })
        })
    }
    catch (err) {

        if (err) { throw err }
    }


})

app.post('/logout' , (req , res) => {
    res.cookie('token' , '' , {sameSite: 'none' , secure: true , httpOnly: true , expires: new Date(0)}).json('ok')
})

const server = app.listen(5000, () => {
    console.log(`port running in ${port}`)
}) 

const wss = new ws.WebSocketServer({ server })

wss.on('connection', (connection, req) => {

    // extract encoded username and userId from cookie

    function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
            // console.log([...wss.clients].map(c => ({ userId: c.userId, username: c.username })))
            client.send(JSON.stringify({
        
                online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username }))
            }
    
            )) 
        })
    }

    connection.isAlive = true
    connection.timer = setInterval(() => {
        connection.ping()
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false
            clearInterval(connection.timer)
            connection.terminate()
            notifyAboutOnlinePeople()
            // console.log('dead')
        } , 1000)
    } , 5000)

    connection.on('pong' , () => {
        clearTimeout(connection.deathTimer)
    })

    // read username and id from cookie for this message
    const cookies = req.headers.cookie
    if (cookies) {
        const tokenCookieString = cookies.split(';').find((str) => str.startsWith('token='))
        
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1]
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) {
                    throw err  
                }
                const { userId, username } = userData
                connection.username = username
                connection.userId = userId
            })

        }
    }



    //notify about online people
    notifyAboutOnlinePeople()
     

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString())
        // console.log(messageData)
        const { recipient, text , file} = messageData
        let filename = ''
        if(file){
            // console.log({file})
            const parts = file.name.split('.')
            const ext = parts[parts.length - 1]
            filename = Date.now().toString() + '.' + ext
            const path = __dirname + '/uploads/' + filename
            // console.log(file.data)
            const bufferData = new Buffer(file.data.split(',')[1] , 'base64')
            fs.writeFile(path , bufferData , () => {
                console.log('file saved ' + path)
            })
        }
        if (recipient && (text || file)) {
            const messageDoc = await Messages.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null
            });  
            // console.log(messageDoc);    
            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    _id: messageDoc._id,
                    file: file ? filename : null,
                    recipient 
                })))
        }
    })


})

wss.on('close' , () => {
    notifyAboutOnlinePeople()
})





// Username = dharshansidharth
// pwd = Dharshan2004

// Username = siddu
// pwd = Siddu2004