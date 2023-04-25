
exports.testMiddleWare = function(req, res, next){
    console.log(req.params.id, "<- Here is the user ID that is passed through the params.")
    next()
}

exports.home = function(req, res){
    res.render('index') 
}

exports.about = function(req, res){
    res.render('about')
}

exports.contact = function(req, res){
    res.render('contact') 
}

exports.error404 = function(req, res){
    res.render('404')
}

