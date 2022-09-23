const debug = require('debug')('app:inicio');
// const dbDegug = require('debug')('app:db');
const express = require('express');
const config = require('config');
// const logger = require('./logger'); //Se agrega la ubicacion completa dado que esta en archivo mio
const morgan = require('morgan');
const Joi = require('joi');
const app = express();

//Metodos Básicos (POST, GET, PUT, DELETE)
//app.post();   //Envío
//app.put();    //Actualización
//app.delete(); //Eliminación

//Función MiddleWare 
app.use(express.json()); //MiddleWare Body Formato JSON
app.use(express.urlencoded({extended:true})) //MiddleWare Formato URLENCODED
app.use(express.static('public')); //MiddleWare archivos estaticos

//Configuracion de entornos
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD Server: ' + config.get('configDB.host'));

//Middleware de terceros Reemplazo Logger (Morgan)
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan Habilitado...');
    debug('Morgan esta habilitado');
}

//Trabajos con la BD
degug('Conectando con la Base de Datos');

//MiddleWare
// app.use(logger);
// app.use(function(req, res, next){
//     console.log('Autenticando..');
//     next();
// });


const usuarios = [
    {id:1, nombre:'Grover'},
    {id:2, nombre:'Pablo'},
    {id:3, nombre:'Pepe'}
];


//Peticiones GET
app.get('/', (req, res) => { //Petición
    res.send('Hola Mundo desde Express.');
});    

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
})

//app.get('/api/usuarios/:year/:mes', (req, res) =>{ //Parametrizacion de la ruta
//    res.send(req.params); //.query en caso de que envie informacion por la ruta
//});

app.get('/api/usuarios/:id', (req, res) => {
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El Usuario no fue Encontrado');
        return;
    }
    res.send(usuario);
});


//Peticiones POST
app.post('/api/usuarios', (req, res) => {

    // const schema = Joi.object({
    //     nombre: Joi.string().min(3).required()
    // });

    // const {error, value} = schema.validate({ nombre: req.body.nombre });
   
    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
        id: usuarios.length + 1,
        nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    } 
});


//Metodo PUT
app.put('/api/usuarios/:id', (req, res) => {
    //Encontrar si existe el objeto usuario
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El Usuario no fue Encontrado');
        return;
    }

    //Validar la informacion de nombre
    const {error, value} = validarUsuario(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});

//Metodo DELETE
app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El Usuario no fue Encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(usuario);
});

const port = process.env.PORT || 3000 //Operador OR O toma el valor de PORT o sino toma 3000
app.listen(port, () => {               //para agregar el valor PORT se usa (set PORT=Puerto en la linea de comnandos)
    console.log(`Escuchando en el puerto ${port}...`);
})


//Functions
function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    return(schema.validate({ nombre: nom }));
}