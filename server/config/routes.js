const controllers = require('../controllers')
const auth = require('./auth')

module.exports = (app) => {
  app.get('/', controllers.home.index)
  app.get('/about', controllers.home.about)

  app.get('/users/register', controllers.users.registerGet)
  app.post('/users/register', controllers.users.registerPost)
  app.get('/users/login', controllers.users.loginGet)
  app.post('/users/login', controllers.users.loginPost)
  app.post('/users/logout', controllers.users.logout)
  app.get('/profile/:username', auth.isAuthenticated, controllers.users.profile)
  app.post('/users/block/:id', controllers.users.block)
  app.post('/users/unblock/:id', controllers.users.unblock)

  app.get('/admins/add', auth.isInRole('Admin'), controllers.users.adminGet)
  app.post('/admins/add', auth.isInRole('Admin'), controllers.users.adminPost)
  app.get('/admins/all', auth.isInRole('Admin'), controllers.users.all)

  app.get('/add', auth.isAuthenticated, controllers.image.addGet)
  app.post('/add', auth.isAuthenticated, controllers.image.addPost)
  app.get('/edit/:id', auth.isInRole('Admin'), controllers.image.editGet)
  app.post('/edit/:id', auth.isInRole('Admin'), controllers.image.editPost)
  app.get('/delete/:id', auth.isInRole('Admin'), controllers.image.deleteGet)
  app.post('/delete/:id', auth.isInRole('Admin'), controllers.image.deletePost)
  app.post('/like/:id', auth.isAuthenticated, controllers.image.like)
  app.post('/dislike/:id', auth.isAuthenticated, controllers.image.dislike)
  app.get('/tag/:tagName', controllers.image.showByTagName)

  app.all('*', (req, res) => {
    res.status(404)
    res.send('404 Not Found!')
    res.end()
  })
}
