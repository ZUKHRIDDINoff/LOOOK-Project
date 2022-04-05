const GET = (req, res) => {
    const users = req.readFile('users')
    const { userId } = req.query

    res.json(
        users.filter(user => userId ? user.userId == userId : true)
    )
}

const POST = async (req, res) => {
    const { username, contact } = await req.body

    if (!username || username.length > 30) {
        res.status = 400
        return res.json({
            status: 400,
            message: "Invalid username!"
        })
    }

    if (!contact || !(/^998(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/).test(contact)) {
        res.status = 400
        return res.json({
            status: 400,
            message: "Invalid contact!"
        })
    }

    const users = req.readFile('users')

    const newUser = {
        userId: users.length ? users.at(-1).userId + 1 : 1,
        username, contact
    }

    users.push(newUser)
    req.writeFile('users', users)

    res.status = 201
    res.json({
        status: 201,
        message: "The user created!",
        data: newUser
    })
}

module.exports = {
    GET, POST
}