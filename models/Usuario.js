const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
	nome:{
		type: String,
		require: true
	},
	email:{
		type: String,
		require: true
	},
	senha:{
		type: String, 
		require: true
	},
	preferencia:{
		type: Array,
		require: true
	},
	carrinho:{
		type: Array,
		require: false
	},
	idAdmin:{
		type: Boolean, 
		default: false
	}
})

// Definindo e sincronizinando o model com o mongoose
mongoose.model('usuarios', Usuario)