require('./models/Produto')

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')

const path =  require('path') // Variavel express padrão 
const app = express() // Pega o objeto express para utilizar na aplicação
const usuario = require('./routes/usuario')
const produto = require('./routes/produto')

const Usuario = mongoose.model('usuarios')
const Produto = mongoose.model('produtos')

require('./config/auth') (passport)

// Utilizando e configurando Node junto com o Jquey

/*var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);
*/
//==========================================================

// Config
	
	// Sessão
	app.use(session({
		secret: '123NerdStoreSession123',
		resave: true,
		saveUninitialized: true
	}))

	// Passport (Depois) Tem que estar nessa orgem
	app.use(passport.initialize())
	app.use(passport.session())

	// Middleware
	app.use(flash())
	app.use((req, res, next)  => {
		//res.locals.nome = 'meu nome'	Cria variaveis globais quaisquer
		// Variaveis globais utilizadas no partials/msg.handlebars
		res.locals.success_msg = req.flash('success_msg')
		res.locals.error_msg = req.flash('error_msg')
		res.locals.error = req.flash('error')
		res.locals.thisUser = null

		res.locals.user = req.user || null

		if (res.locals.user != null){
			const thisUser = {
				id: req.user.id,
				nome: req.user.nome,
				email: req.user.email,
				prefencia: req.user.preferencia
			}
			res.locals.thisUser = thisUser
		}

		next()

	})

	//Body parser = Comunica o back e o front-end
	app.use(bodyParser.urlencoded({extended: true}))
	app.use(bodyParser.json())

	// Handlebars = template engine
	app.engine('handlebars', handlebars({defaultLayout: 'main'}))
	app.set('view engine', 'handlebars')

	// Mongoose = trabalha com o mongoDb junto com express 
	mongoose.Promise = global.Promise
	// fazendo conexão com o banco de dados
	mongoose.connect('mongodb://FelipeNunes:geekshell@geekshell-prod-shard-00-00.7gnqf.mongodb.net:27017,geekshell-prod-shard-00-01.7gnqf.mongodb.net:27017,geekshell-prod-shard-00-02.7gnqf.mongodb.net:27017/GeekShell-prod?ssl=true&replicaSet=atlas-4pk57k-shard-0&authSource=admin&retryWrites=true&w=majority&ssl=true').then(() => {
		console.log('Banco conectado com sucesso')
	}).catch((erro) => {
		console.log('Erro de conexão fatal: ' + erro)
	})

	// Public = Config dos arquivos estáticos (Bootstrap/img e etc)
	app.use(express.static(path.join(__dirname, 'public')))

	// Middleware = trata de requisições antecipadamentne
	app.use((req, res, next) => {
		console.log('Middleware Ativado')
		next()
	})

// Rotas Padrão
	
	// Rota /
	app.get('/', (req, res) => {

		Produto.find().populate('idUsuario').sort({data: 'desc'}).lean().then((produtos) => {

			if (req.user == null){
				res.render('index', {produtos: produtos})
			}
			else{
				console.log(res.locals.thisUser)
				res.render('index', {thisUser: res.locals.thisUser, produtos: produtos})
			}

		}).catch((erro) => {
			res.render('index', {thisUser: res.locals.thisUser})
		})
	})

	// Prefixos
	app.use('/usuario', usuario)
	app.use('/usuario/produto', produto)
// Conexão

//allowProtoMethodsByDefault = true
//allowedProtoMethods = true
//allowProtoPropertiesByDefault = true

const PORTA = process.env.PORT | 8081

// Abre o servidor para aplicação rodar
app.listen(PORTA, () => {
	console.log('Aplicação rodando na porta ' + PORTA)
})
