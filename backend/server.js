const express = require('./lib/express.js')
const PORT = process.env.PORT || 5000
const path = require('path')
const app = new express()

app.set('database', path.join(__dirname, 'database'))
app.set('static', path.join(__dirname, 'public'))

const userController = require('./modules/user.js')
const foodController = require('./modules/food.js')
const orderController = require('./modules/order.js')

app.get('/users', userController.GET)
app.get('/foods', foodController.GET)
app.get('/orders', orderController.GET)

app.post('/users', userController.POST)
app.post('/orders', orderController.POST)

app.listen(PORT, () => console.log('backend server is runnin on http://localhost:' + PORT))