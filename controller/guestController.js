
exports.notFoundPage = function(req, res){
    res.render('404')
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

