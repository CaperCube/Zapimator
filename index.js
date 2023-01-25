////////////////////////////////////////
// Packages
////////////////////////////////////////
const express = require('express')
const app = express()
const serv = require('http').Server(app)
const PORT = process.env.PORT || 3001

////////////////////////////////////////
// Server setup
////////////////////////////////////////
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname + '/public'))

// listen for requests
serv.listen(PORT, () => {
    console.log(`Server listening for connections on port ${PORT}`)
})

///////////////////////////////////////
// Server started
///////////////////////////////////////
console.log(
    `Web server has started!`,
    `Link to app: http://localhost:${PORT}/index.html`
)