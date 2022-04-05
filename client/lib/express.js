const querystring = require('querystring')
const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')

const controllerFunctions = {}
const globalVariables = {}

const contentTypes = {
	'.jpg': 'image/jpg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.html': 'text/html',
	'.css': 'text/css',
	'.txt': 'text/plain',
	'.json': 'application/json',
	'.zip': 'application/zip',
	'.pdf': 'application/pdf',
	'.js': 'application/javascript',
	'.mp4': 'video/mp4',
}

function serverFunction (req, res) {
	const { pathname, query } = url.parse(req.url)

	const queryData = querystring.parse(query)
	const method = req.method.toUpperCase()
	const reqUrl = pathname.toLowerCase()

	// request methods and properties
	req.query = queryData
	if(method != 'GET') {
		req.body = new Promise((resolve, reject) => {
			let str = ''
			req.on('data', chunk => str += chunk)
			req.on('end', chunk => {
				try {
					const parsedData = JSON.parse(str)
					return resolve(parsedData)
				} catch(error) {
					return reject(error)
				}
			})
		})	
	}

	// response methods and properties
	res.sendFile = function (filePath) {
		const extension = path.extname(filePath)

		if(!extension || !fs.existsSync(filePath)) {
			throw new Error("Invalid file path for sendFile!")
		}

		const contentType = contentTypes[extension] || 'application/octet-stream'

		res.writeHead(200, { 'Content-Type': contentType })
		res.write(fs.readFileSync(filePath))
		return res.end()
	}

	res.render = function (htmlFilePath) {
		const filePath = path.join(globalVariables['views'] || '', htmlFilePath + '.html')

		if(!fs.existsSync(filePath)) {
			throw new Error("Invalid file path for render!")
		}

		res.writeHead(200, { 'Content-Type': 'text/html' })
		res.write(fs.readFileSync(filePath))
		return res.end()
	}


	if(
		controllerFunctions[method] && 
		controllerFunctions[method][reqUrl]
	) {
		controllerFunctions[method][reqUrl](req, res)
	} else {
		const filePath = path.join( globalVariables['static'] || '', reqUrl )
		const fileExists = fs.existsSync(filePath)
		const extension = path.extname(reqUrl)

		if(!fileExists || !extension) return res.end(`Cannot ${method} ${reqUrl}`)

		const contentType = contentTypes[extension] || 'application/octet-stream'

		res.writeHead(200, { 'Content-Type': contentType })
		res.write(fs.readFileSync(filePath))
		return res.end()
	}

}


class Express {
	#server

	constructor () {
		this.#server = http.createServer(serverFunction)
	}

	get (route, callback) {
		controllerFunctions['GET'] = controllerFunctions['GET'] || {}
		route = route.toLowerCase()

		controllerFunctions['GET'][route] = callback
	}

	post (route, callback) {
		controllerFunctions['POST'] = controllerFunctions['POST'] || {}
		route = route.toLowerCase()

		controllerFunctions['POST'][route] = callback
	}

	put (route, callback) {
		controllerFunctions['PUT'] = controllerFunctions['PUT'] || {}
		route = route.toLowerCase()

		controllerFunctions['PUT'][route] = callback
	}

	delete (route, callback) {
		controllerFunctions['DELETE'] = controllerFunctions['DELETE'] || {}
		route = route.toLowerCase()

		controllerFunctions['DELETE'][route] = callback
	}

	set(key, value) {
		globalVariables[key] = value
	}

	listen (PORT, callback) {
		this.#server.listen(PORT, callback)
	}
}


module.exports = Express