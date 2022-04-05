const GET = (req, res) => {
    let orders = req.readFile('orders')
    let users = req.readFile('users')
    let foods = req.readFile('foods')
    const { userId, orderId, foodId } = req.query

    orders = orders.map(order => {
        order.user = users.find(user => user.userId == order.userId)
        order.food = foods.find(food => food.foodId == order.foodId)

        return order
    })

    res.json(
        orders.filter(el => {
            let user = userId ? el.userId == userId : true
            let food = foodId ? el.foodId == foodId : true
            let order = orderId ? el.orderId == orderId : true

            delete el.userId
            delete el.foodId

            return user && food && order
        })
    )
}

const POST = async (req, res) => {
    const { userId, foodId, count } = await req.body

    const users = req.readFile('users').map(el => el.userId)
    const foods = req.readFile('foods').map(el => el.foodId)

    if (!users.includes(+userId)) {
        res.status = 400
        return res.json({
            status: 400,
            message: "Invalid userId!"
        })
    }

    if (!foods.includes(+foodId)) {
        res.status = 400
        return res.json({
            status: 400,
            message: "Invalid foodId!"
        })
    }

    if (isNaN(+count) || count > 10 || count < 1) {
        res.status = 400
        return res.json({
            status: 400,
            message: "Invalid count!"
        })
    }

    const orders = req.readFile('orders')
    let order = orders.find(order => order.userId == userId && order.foodId == foodId)

    if (order) {
        order.count = +order.count + +count
    } else {
        order = {
            orderId: orders.length ? orders.at(-1).orderId + 1 : 1,
            userId, foodId, count
        }
        orders.push(order)
    }

    req.writeFile('orders', orders)

    res.status = 201
    res.json({
        status: 201,
        message: "The order created!",
        data: order
    })
}

module.exports = {
    GET, POST
}