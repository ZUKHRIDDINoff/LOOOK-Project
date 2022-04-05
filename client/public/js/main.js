const customersList = document.querySelector('.customers-list')
const telephoneInput = document.querySelector('#telephoneInput')
const usernameInput = document.querySelector('#usernameInput')
const customerName = document.querySelector('.customer-name')
const foodsSelect = document.querySelector('#foodsSelect')
const ordersList = document.querySelector('.orders-list')
const foodsCount = document.querySelector('#foodsCount')
const foodsForm = document.querySelector('#foodsForm')
const clientId = document.querySelector('#clientId')
const userAdd = document.querySelector('#userAdd')

const API = 'http://192.168.0.220:5000'

async function renderUsers() {
	let response = await fetch(API + '/users')
	const users = await response.json()

	customersList.innerHTML = null
	for(let user of users) {
		const [li, span, a] = createElements('li', 'span', 'a')
		
		li.classList.add('customer-item')
		span.classList.add('customer-name')
		a.classList.add('customer-phone')

		a.setAttribute('href', 'tel:+' + user.contact)

		span.textContent = user.username
		a.textContent = '+' + user.contact

		li.append(span, a)
		customersList.append(li)

		li.addEventListener('click', event => {
			customerName.textContent = user.username
			clientId.textContent = user.userId

			window.localStorage.setItem('userId', user.userId)
			window.localStorage.setItem('username', user.username)

			renderOrders(user.userId)
		})
	}
}


async function renderFoods() {
	let response = await fetch(API + '/foods')
	const foods = await response.json()

	for(let food of foods) {
		const [option] = createElements('option')
		
		option.value = food.foodId
		option.textContent = food.foodName

		foodsSelect.append(option)
	}
}


async function renderOrders (userId) {
	if (!userId) return
	
	let response = await fetch(API + '/orders?userId=' + userId)
	const orders = await response.json()

	ordersList.innerHTML = null
	for(let order of orders) {
		const [liEl, imgEl, divEl, nameEl, countEl] = createElements('li', 'img', 'div', 'span', 'span')
		
		const food = order.food
		
		liEl.classList.add('order-item')
		nameEl.classList.add('order-name')
		countEl.classList.add('order-count')

		imgEl.setAttribute('src', API + '/' + food.foodImg)

		nameEl.textContent = food.foodName
		countEl.textContent = order.count

		divEl.append(nameEl, countEl)
		liEl.append(imgEl, divEl)
		ordersList.append(liEl)
	}
}


async function addUser (event) {
	event.preventDefault()

	const username = usernameInput.value.trim()
	const contact = telephoneInput.value.trim()

	if(!username || username.length > 30) {
		return alert('Invalid username!')
	}

	if(!(/^998(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/).test(contact)) {
		return alert('Invalid contact!')
	}

	const newUser = {
		username,
		contact
	}

	await fetch(API + '/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newUser)
	})

	return renderUsers()
}


async function addOrder (event) {
	event.preventDefault()

	const foodId = foodsSelect.value.trim()
	const count = foodsCount.value.trim()
	const userId = clientId.textContent.trim()

	if(
		!count ||
		+count > 10 ||
		!userId
	) return


	let response = await fetch(API + '/orders', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			foodId, userId, count
		})
	})

	return renderOrders(userId)
}

const userId = window.localStorage.getItem('userId')
const username = window.localStorage.getItem('username')

userId && (clientId.textContent = userId)
username && (customerName.textContent = username)

renderUsers()
renderFoods()
renderOrders(userId)

userAdd.addEventListener('submit', addUser)
foodsForm.addEventListener('submit', addOrder)