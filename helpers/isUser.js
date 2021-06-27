module.exports = {
	isUser: function (req, res, next){
		if (req.isAuthenticated()){
			return next()
		}

		req.flash('error_msg', 'Para continuar é necessário ser um usuario')
		res.redirect('/usuario/registro')
	}
}