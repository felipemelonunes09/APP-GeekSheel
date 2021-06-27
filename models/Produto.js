const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Produto = new Schema({
	idUsuario: {
		type: Schema.Types.ObjectId,
		ref: 'usuarios', 
		require: true
	},
	nome: {
		type: String,
		require: true
	},
	preco: {
		type: Number,
		require: true
	},
	urlImage:{
		type: String,
		require: true
	},
	descricao:{
		type: String,
	},
	categoria:{
		type: String,
	},
	curtida:{
		type: Number
	}
})

mongoose.model('produtos', Produto)

/*
categoria: { 
 		type: Schema.Types.ObjectId,
 		ref: "categorias",
 		required: true	
 	},
*/