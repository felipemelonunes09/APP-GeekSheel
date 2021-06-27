require('../models/Produto')
require('../models/Usuario')

const mongoose = require('mongoose')
const express = require('express')
const {isUser} = require('../helpers/isUser')

const router = express.Router()
const Produto = mongoose.model('produtos')
const Usuario =  mongoose.model('usuarios')

// /usuario/produto/...

router.get('/view/:id', (req, res) => {

	Produto.findOne({_id: req.params.id}).lean().then((produto) => {	

		console.log('AQUI EM BAIXO')
		console.log(produto)

		Usuario.findOne({_id: produto.idUsuario}).lean().then((usuario) => {
			res.render('produto/index', { produto: produto, usuario: usuario})
		})
	}).catch((erro) => {
		console.log(erro)
		req.flash('error_msg', 'Erro grave ocorreu tente novamente mais tarde')
		res.redirect('/')
	})

})

// Rota para editar
router.get('/editar/:id', isUser, (req, res) => {

	Produto.findOne({_id: req.params.id}).lean().then((produto) => {
		res.render('produto/editar', {produto: produto})
	}).catch((erro) => {
		req.flash('error_msg', 'Um erro inesperado aconteceu tente novamente mais tarde')
		res.redirect('/')
	})
})

//Rota para editar no mongo
router.post('/editar', isUser, (req, res) => {

	Produto.findOne({_id: req.body.formId}).then((produto) => {

		produto.nome = req.body.formNome
		produto.preco = req.body.formPreco
		produto.urlImage = req.body.formImage
		produto.descricao = req.body.formDescricao
		produto.categoria = req.body.formCategoria

		console.log(produto)

		produto.save().then(() => {

			req.flash('success_msg', 'Seu item foi alterado com sucesso')
			res.redirect('/usuario')

		}).catch((erro) => {
			req.flash('error_msg', 'Um erro ao salvar aconteceu, tente mais tarde')
			res.redirect('/')
		})

	}).catch((erro) => {

		console.log(erro)

		req.flash('error_msg', 'Um erro ao editar aconteceu tente mais tarde novamente')
		res.redirect('/')
	})

})

// Rota para deletar
router.get('/deletar/:id', isUser, (req, res) => {

	Produto.findOneAndDelete({_id: req.params.id}).then((produto) => {
		res.redirect('/usuario/')
	}).catch((erro) => {
		console.log(erro)
		req.flash('error_msg', 'Um erro interno aconteceu')
		res.redirect('/')
	})
})

router.get('/anunciar', isUser , (req, res) => {
	res.render('produto/anunciar')
})

router.post('/anunciar', isUser, (req, res) => {

	// Caso todos os campos estejam corretos
	if (validationCad(req)){

		const novoProduto = new Produto({
			idUsuario: res.locals.thisUser.id.toString(),
			nome: req.body.formNome,
			preco: req.body.formPreco,
			urlImage: req.body.formImage
		})

		novoProduto.save().then(() => {

			req.flash('success_msg', ':) Seu produto foi cadastro com sucesso')
			res.redirect('/usuario')

		}).catch((erro) => {
			req.flash('error_msg', 'Um erro interno aconteceu tente novamente mais tarde')
			res.redirect('/')
		})

	}
	else{
		res.redirect('/usuario/produto/anunciar')
	}

})

function validationCad(req) {

	var controle = true
	if (!req.body.formNome || typeof req.body.formNome == undefined || req.body.formNome == null){
		req.flash('error_msg', 'Poxa ;( Não se esqueça de definir um nome')
		console.log(req.body.formNome)
		return false
	}

	if (!req.body.formPreco || typeof req.body.formPreco == undefined || req.body.formPreco == null){
		req.flash('error_msg', 'Poxa ;( Ei ei coloque um valor para seu produto ou quer que seja de graça?')
		return false
	}

	if (!req.body.formImage || typeof req.body.formImage == undefined || req.body.formImage == null){
		req.flash('error_msg', 'Poxa ;( Não se esqueça de escolher uma imagem')
		return false
	}

	return true
}

module.exports = router

