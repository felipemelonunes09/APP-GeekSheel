const localStrategy = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function (passport) {
	
	passport.use(new localStrategy({usernameField: 'formEmail1', passwordField: 'formSenha1'}, (email, senha, done) => {
		Usuario.findOne({email: email}).then((usuario) => {
			if (!usuario){
				return done (null, false, {mensage: 'Desculpe mas essa conta não existe'})
			}	

			// Se tiver usuario então compara os hash das senhas
			bcrypt.compare(senha, usuario.senha, (erro, batem) => {
				if (batem){
					console.log('Senhas bateram parabens')
					return done(null, usuario)
				}
				else{
					return done (null, false,  'Senha incorreta')
				}
			})

		})

	}))

	// Serialize
	passport.serializeUser((usuario, done) => {
		done(null, usuario.id)
	})

	passport.deserializeUser((id, done) => {
		Usuario.findById(id, (err, usuario) => {
			done(err, usuario)
		})
	})

}