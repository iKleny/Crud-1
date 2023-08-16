import express from "express";
import { GastosService } from "./services/gastos.service.js";
import { UsuariosService } from './services/usuarios.service.js';
import session from 'express-session'

// Init express
const server = express()

// Set config session into express
server.use(session({
    secret: 'daniel',
    resave: false,
    saveUninitialized: false
}));

// Set config view
server.set('view engine', 'ejs')

// Set static files
server.use(express.static("Styles"))

// Set urlencoded
server.use(express.urlencoded({ extended: true }))

// Services
const usuariosService = new UsuariosService()
const gastosService = new GastosService()


/* MIDDLEWARES */
function requireAuthentication(req, res, next) {
    if (req.session.userLogin) {
        next();
    } else {
        res.redirect('/invalida')
    }
}


/* FUNCTIONS */
function pageLanding(req, res) {
    let login = req.session.userLogin
    return res.render("index", { login })
}

function sucesso(req, res) {
    return res.render("sucesso")
}

function invalida(req, res) {
    return res.render("invalida")
}

function criar(req, res) {
    return res.render("criar")
}

function logsucesso(req, res) {
    return res.render("logsucesso")
}

function logar(req, res) {
    return res.render("log")
}

function data(req, res) {
    return res.render("data")
}

function att(req, res) {
    const { id } = req.params
    const { login } = req.params

    return res.render("att", { id, login })
}

async function pageSend(req, res) {
    await gastosService.insert({
        nome: req.body.nome,
        tipo: req.body.tipo,
        credito: req.body.credito,
        data: req.body.data,
        debito: req.body.debito,
        motivo: req.body.motivo
    })

    return res.redirect("/sucesso")
}

async function remove(req, res) {
    const { id } = req.params
    const { login } = req.session.userLogin
    await gastosService.delete(id)
    return res.redirect(`/searchData/${encodeURIComponent(login)}`)
}

async function atualizar(req, res) {
    const id = req.params.id;
    const { login } = req.session.userLogin
    const { nome, tipo, credito, data, debito, motivo } = req.body;
    await gastosService.update(id, { nome, tipo, credito, data, debito, motivo });

    return res.redirect(`/searchData/${encodeURIComponent(login)}`);
}

async function searchData(req, res) {
    let login = req.session.userLogin
    const dados = await gastosService.findByName(login)
    return res.render("searchData", { array: dados })
}

async function logon(req, res) {
    const { login, senha } = req.body
    
    return await usuariosService.auth(login, senha)
    .then( user => {
        req.session.userLogin = user.login
        return res.render('logsucesso', {login: user.login})
    })
    .catch( e => {
        console.log(e)
        return invalida(req, res)
    })
}

async function logout(req, res){
    req.session.destroy()
    return logar(req, res)
}

async function save(req, res) {
    await usuariosService.insert({
        login: req.body.login,
        senha: req.body.senha,
        email: req.body.email
    })
    return res.redirect("/sucesso")
}

/* ROUTES */
server.get("/", logar) // View render log
server.get("/index", requireAuthentication, pageLanding) // Main page
server.get("/sucesso", requireAuthentication, sucesso) // View render 'logsucesso'
server.get("/logsucesso", requireAuthentication, logsucesso) // View render 'logsucesso'
server.get("/invalida", invalida) // View render 'invalida'
server.get("/criar", requireAuthentication, criar) // View render 'criar'
server.get("/data", requireAuthentication, data) // View render 'data'
server.get("/att/:id", requireAuthentication, att) // View render 'att'
server.post("/pageSend", requireAuthentication, pageSend) // Insert gastos
server.get("/remove/:id", requireAuthentication, remove) // Delete gastos by id
server.post("/atualizar/:id", requireAuthentication, atualizar) // Update gastos
server.get("/searchData", requireAuthentication, searchData) // Find by name
server.post("/logon", logon) // Auth
server.get("/logout", requireAuthentication, logout) // Logout
server.post("/save", requireAuthentication, save) // Insert user


// Rota para teste de métodos
// Depois pode apagar
server.get("/teste", requireAuthentication, async (req, res) => {
    const user = await usuariosService.findByLogin('matheus')
    return res.send(user)
})


// Listen server in port 5500
server.listen(5500)