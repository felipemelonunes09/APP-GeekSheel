require('../models/Usuario') // Requere o model de usuario
require('../models/Produto')

const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcryptjs') // Encriptador
const passport = require('passport')

const router =  express.Router()
const Usuario = mongoose.model('usuarios')  // Model usuario
const Produto = mongoose.model('produtos')
const {isUser}= require('../helpers/isUser') 

// /usuario


const errorClass = {
		'erros': [
			{'class': '0', 'value': '0'}, // Form Nome
			{'class': '0', 'value': '0'}, // Form Email 2
			{'class': '0', 'value': '0'}, // Form Senha 2
			{'class': '0', 'value': '0'}, // Form Email 1
			{'class': '0', 'value': '0'}, // Form Senha 1
	]}

	router.get('/', isUser,(req, res) => {
		res.render('usuario/index')
	})

	// Rota para mostra os anuncios publicos criado  usuario
	router.get('/anuncios', isUser,(req, res) => {

		Produto.find({ idUsuario: res.locals.thisUser.id }).lean().then(( prodAnuncio ) => {
			console.log(prodAnuncio)
			res.render('usuario/index', {prodAnuncio: prodAnuncio})
		})
	})

	// Rota de inicio onde há varios anuncios
	router.get('/inicio', isUser, (req, res) => {

		Produto.find().populate('idUsuario').sort({data: 'desc'}).lean().then((produtos) => {
			res.render('usuario/index', { prodInicio: produtos })
		})

	})

	// Rota para o carrinho do usuario
	router.get('/carrinho', isUser,(req, res) => {

		const produtos = []
		var total = 0
		Usuario.findOne({_id: res.locals.thisUser.id}).lean().then((usuario) => {

			for (var i = usuario.carrinho.length - 1; i >= 0; i--) {

				Produto.findOne({_id: usuario.carrinho[i]}).lean().then((produto) => {
					if (produto){
						produtos.push(produto)
						total += Number(produto.preco)
						console.log(total)
					}

				}).catch((erro) => {
					req.flash('error_msg', 'Erro ao puxar os produtos do carrinho')
					res.redirect('/')
				})
			}

		}).catch((erro) => {
			console.log(erro)
			req.flash('error_msg', 'Erro ao localizar o usuario, por favor tente novamente mais tarde')
			res.redirect('/')
		})
		res.render('usuario/index', {prodCarrinho: produtos})

	})

	router.get('/carrinho/limpar', isUser, (req, res) => {

		Usuario.findOne({_id: res.locals.thisUser.id}).then((usuario) => {

			usuario.carrinho = []

			usuario.save().then(() =>{
				req.flash('success_msg', 'Item excluido com sucesso')
				res.redirect('/usuario/carrinho')

			}).catch((erro) => {
				req.flash('error_msg', 'Erro fatal ocorreu')
				res.redirect('/')
			})

		}).catch((erro) => {
			req.flash('error_msg', 'Erro interno por favor tente novamente mais tarde')
			res.redirect('/')
		})
	})

	// Rota get para add algo no carrinho
	router.get('/carrinho/add/:id', isUser,(req, res) => {
		
		Produto.findOne({_id: req.params.id}).lean().then((produto) => {

			if (produto.idUsuario == res.locals.thisUser.id){
				req.flash('error_msg', 'Seu produto não pode ser adicionado no carrinho')
				res.redirect('/usuario/anuncios')
			}
			else{

				Usuario.findOne({_id: res.locals.thisUser.id}).then((usuario) => {

						usuario.carrinho.push(produto._id)
						console.log(usuario)

						usuario.save().then(() => {
							req.flash('success_msg', 'Seu produto foi adicionado no carrinho')
							res.redirect('/usuario/carrinho')
						}).catch((erro) => {
							req.flash('error_msg', 'Um erro ao salvar no carrinho aconteceu')
							res.redirect('/')
						})
					

				}).catch((erro) => {
					console.log(erro)
					req.flash('error_msg', 'Erro ao encontrar usuario aconteceu')
					res.redirect('/')
				})
			}



		}).catch((erro) => {
			console.log(erro)
			req.flash('error_msg', 'Erro interno aconteceu')
			res.redirect('/')
		})
	})

	router.get('/carrinho/limpar', (req, res) => {

	})

	router.get('/registro/edit', isUser, (req, res) => {

		errorClass.erros[0].value = res.locals.thisUser.nome
		errorClass.erros[1].value = res.locals.thisUser.email
		res.render('usuario/editar', {errorClass: errorClass})
	})

	router.post('/registro/edit', (req, res) => {

		setErrorClass(req)
		if (validationCad(req, res, null)){

			// Acha o usuario que ira ser modificado
			Usuario.findOne({email: res.locals.thisUser.email}).then((usuario1) => {

				// Caso o email dele seja diferente do que esta no formularia ira pesquisar se há email disponivel

				Usuario.findOne({email: req.body.formEmail2}).then((usuarioVerif) => {
					// Evitar o erro de pesquisar o email do mesmo cara
				if (req.body.formEmail2 == usuario1.email){
					usuario1.email = req.body.formEmail2
				}
				else{
					if (usuarioVerif){
						req.flash('error_msg', 'Este email ja esta sendo utilizad no site')
						res.redirect('/usuario/registro/edit')
					}
					else{
						console.log('MOMENTO EM QUE HÁ SUBSTITUIÇÃO DO EMAIL')
						usuario1.email = req.body.formEmail2
						console.log('MARCADOR 1 EMAIL' + usuario1.email)
						console.log('MARCADOR 2 FORM EMAIL' + req.body.formEmail2)
					}
				}

				}).catch((erro) => {
					req.flash('error_msg', ';( Eitaaa um erro interno aconteceu, desculpe')
					res.redirect('/usuario/registro/edit')
				})


				console.log('MARCADOR 3 ULTIMO ' + usuario1.email)
				usuario1.nome = req.body.formNome
				usuario1.senha =  req.body.formSenha2
				usuario1.preferencia = [req.body.formFilmes, req.body.formSeries, req.body.formGames]

				bcrypt.genSalt(10, (erro, salt) => {
						bcrypt.hash(usuario1.senha, salt, (erro, hash) => {
							// Caso erro
							if (erro){
								req.flash('error_msg', 'Eita :O um erro de senha ocorreu')
								res.redirect('/usuario/registro/edit')
							}
							else{

								usuario1.senha = hash
								usuario1.save().then(() => {
									req.flash('success_msg', 'Parabénssss :) seu perfil foi editado com sucesso em nosso site')
									res.redirect('/usuario/')
								}).catch((erro) => {
									req.flash('error_msg', 'Erro grave ocorreu tente novamente mais tarde')
								})
							}
						})
					})


			}).catch((erro) => {
				req.flash('error_msg', ';( Algum erro interno aconteceu, por favor tente novamente mais tarde')
			})

		}
		res.render('usuario/editar', {errorClass: errorClass})
	})

	// Rotas0
	router.get('/registro', (req, res) => {
		res.render('usuario/registro')
	})

	router.post('/registro/login', (req, res, next) => {


		if (validationLogin(req, res, null)){

			passport.authenticate('local', {
				successRedirect: '/',
				failureRedirect: '/usuario/registro',
				failureFlash: true
			}) (req, res, next)
		}
		else{ // Manda os erros para a view
			res.render('usuario/registro', {errorClass: errorClass})
		}

	})

	router.post('/registro/cad', (req, res) => {

		if (validationCad(req, res, null)){

			// Verificar se há um mesmo email
			Usuario.findOne({email: req.body.formEmail2}).then((usuario) => {

				if (usuario){
					req.flash('error_msg','Este email ja está cadastrado no site')
					res.redirect('/usuario/registro/')
				}else{

					// Schema usuario
					const novoUsuario = new Usuario({
						nome: req.body.formNome,
						email: req.body.formEmail2,
						senha: req.body.formSenha2,
						preferencia: [req.body.formFilmes, req.body.formSeries, req.body.formGames]
					})

					bcrypt.genSalt(10, (erro, salt) => {
						bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {

							if (erro){
								req.flash('error_msg', 'Erro ao cadastrar ocorreu, tente novamente mais tarde')
							}
							else{

								novoUsuario.senha = hash
								novoUsuario.save().then(() => {
									req.flash('success_msg', 'Cadastro concluído com sucesso')
								}).catch((erro) => {
									req.flash('error_msg', 'Erro tente novamente mais tarde')
								})
							}
							res.redirect('/')
						})
					})
				}
				
			}).catch((erro) => {
				req.flash('error_msg', 'Eita ;( Ocorreu um erro de verificação do email tente novamente mais tarde')
				console.log('Erro rota /usuario/cad ' + erro)
				res.redirect('/')
			})
		}
		else{
			// Renderizando a view novamente com os erros atualizados
			res.render('usuario/registro', {errorClass: errorClass})
		}

	})

	// Rota para sair
	router.get('/logout', (req, res) => {
		req.logout()
		req.flash('success_msg', ':) Tudo certo, você foi deslogado')
		res.redirect('/')
	})

	function validationLogin(req, res, rotaOpcional) {

		var controle = true
		if (!rotaOpcional){
			rotaOpcional = '/'
		}

		setErrorClass(req)

		errorClass.erros[3].value = req.body.formEmail1
		errorClass.erros[4].value = req.body.formSenha1

		if (!req.body.formEmail1 || req.body.formEmail1 == null || typeof req.body.formEmail1 == undefined){
			errorClass.erros[3].class = 'is-invalid'
			controle = false
		}
		else{
			errorClass.erros[3].class = 'is-valid'
		}

		if (!req.body.formSenha1 || req.body.formSenha1 == null || typeof req.body.formSenha1 == undefined){
			errorClass.erros[4].class = 'is-invalid'
			controle = false
		}
		else{
			errorClass.erros[4].class = 'is-valid'
		}

		return controle
	}

	// Função para validar o formulario 
	function validationCad(req, res, rotaOpcional) {

		var controle = true
		if (!rotaOpcional){
			rotaOpcional = '/'
		}

		// JSON is-valid = não ha erros is-invalid =  há erros = json de comunicação entre o back e front
		setErrorClass(req)


		if (!req.body.formNome || req.body.formNome == null || typeof req.body.formNome == undefined){
			errorClass.erros[0].class = 'is-invalid'
			controle = false
		}
		else{
			errorClass.erros[0].class = 'is-valid'
		}

		if (!req.body.formEmail2 || req.body.formEmail2 == null || typeof req.body.formEmail2 == undefined){
			errorClass.erros[1].class = 'is-invalid'
			controle = false
		}
		else{
			errorClass.erros[1].class = 'is-valid'
		}

		if (!req.body.formSenha2 || req.body.formSenha2 == null || typeof req.body.formSenha2 == undefined){
			errorClass.erros[2].class = 'is-invalid'
			controle = false
		}
		else{
			errorClass.erros[2].class = 'is-valid'
		}


		return controle;
	}


	function setErrorClass(req) {
		errorClass.erros[0].value = req.body.formNome
		errorClass.erros[1].value = req.body.formEmail2
		errorClass.erros[2].value = req.body.formSenha2
		errorClass.erros[3].value = req.body.formEmail1
		errorClass.erros[4].value = req.body.formSenha1

	}

// Exportando modulo
module.exports = router