const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const strict =  require('assert');
const { initializeApp } = require('firebase/app');
const session = require('express-session');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require ("firebase/auth");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const port = 3000;


//configruacion de mongo

let MONGO_URI = "mongodb+srv://fernandoflores1:teto2003@examen2.febwi.mongodb.net/App?retryWrites=true&w=majority&appName=Examen2"

const client = new MongoClient(MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true
    }
});

let db;
async function connect() {
    try {
        await client.connect()
        console.log("Conectado a la base de datos");
        db = client.db("Examen2");

    } catch (e) {
        console.error("Error al conectar a la base de datos: ", e)
    }
}


//configuracion de firebase

var admin = require('firebase-admin');

var serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

const firebaseConfig = {
    apiKey: "AIzaSyBAE2EUo4hYYLTjHf7bw1-UOTV4HIiwym4",
    authDomain: "examen2-fd32f.firebaseapp.com",
    projectId: "examen2-fd32f",
    storageBucket: "examen2-fd32f.firebasestorage.app",
    messagingSenderId: "700487271463",
    appId: "1:700487271463:web:f1ed8748e4441c84d3ba02",
    measurementId: "G-FT9YTCPEF3"
  };

  // Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

app.listen(port, ()=>{
    console.log(`Servidor corriendo en http://localhost:${port}`);
    connect();
});

//console.log(admin.app().options);

/*control de usuarios en firebase */

//crear usuario
app.post('/createUser', async (req, res) => {
    const {email, password} = req.body
    try{
        const user = await auth.createUser({
            email: email,
            password: password
        });
        res.status(200).send({
            user: user,
            message: 'Usuario registrado exitosamente.'
        })
    }catch (e) {
        res.status(401).send({
            error: e.message
        });
    }
});

//login

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    console.log(req.body);

    try{
        const auth = getAuth(firebaseApp);
        const loggedInUser = await signInWithEmailAndPassword(auth, email, password)
        res.status(200).send({
            user: loggedInUser,
            message: 'Iniciado sesion exitosamente!'
        })
    }catch (e){
        res.status(401).send({
            error: e.message
        });
    }

});


//logout 
app.post('/logout', async (req, res) => {
    
    try {
        const auth = getAuth(firebaseApp);
        await signOut(auth);
        res.status(200).send({
            message: 'Sesion cerrada',
        })
    }catch(e){
        res.status(401).send({
            error: e.message
        });
    }
});


/*posts de mongo*/

//crear posts
app.post('/createPost', async (req,res) => {    
    try{
        const collection = db.collection('posts');
        const result = await collection.insertOne({ 
            title: req.body.title,
            content: req.body.content,
            user: req.body.user
         });
        res.status(201).send({
            title: req.body.title,
            content: req.body.content,
            user: req.body.user,
            message: "Post Creado exitosamente"
        })

    }catch(e){
        res.status(401).send({
            error: e.message
        });
    }
});

//lista de posts
app.get("/listPost", async(req,res) =>{
    try{
        const collection = db.collection('posts');
        const lista = await collection.find({}).toArray();
        res.status(200).send({
            list: lista,
            message: "Lista de Posts obtenida"
        })

    }catch(e){
        res.status(401).send({
            error: e.message
        });
    }
});

//editar post
app.put("/editPost/:id", async (req,res) => {
    const id = req.params.id.replace(":","");
    try {
        const collection = db.collection('posts');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: {title: req.body.newTitle, 
                content: req.body.newContent, 
                user: req.body.user}  
            });

            res.status(200).send({
                result: resultado,
                message: "Se modifico el post con exito!"
            })

    }catch(e){
        res.status(401).send({
            error:e.message
        });
    }
});

//eliminar post
app.delete("/deletePost/:id", async (req,res) => {
    const id = req.params.id.replace(":","");
    try{
        const collection = db.collection('posts');
        const result = await collection.deleteOne(
            { _id: new ObjectId(id)}
        );

        if (result.deletedCount > 0) {
            res.status(200).send({
                resultado: result,
                mensaje: "Post eliminado con exito!",
            });
        } else {
            res.status(404).send({
                error: "Post not found",
            });
        }

    }catch(e){
        res.status(401).send({
            error:e.message
        });
    }
});