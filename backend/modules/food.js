const GET = (req, res) => {
    const foods = req.readFile('foods')
    const { foodId } = req.query

    res.json(
        foods.filter(food => foodId ? food.foodId == foodId : true)
    )
}

module.exports = {
    GET
}