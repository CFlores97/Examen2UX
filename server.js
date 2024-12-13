const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const strict =  require('assert');
const { initializeApp } = require('firebase/app');
const session = require('express-session');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require ("firebase/auth");

let parser = bodyParser.urlencoded({extended: true});
const app = express();
app.use(bodyParser.json());
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
app.post('/createPost', async (req,res) => {
    const {title, content} = req.body;
    
    try{
        if (!title || !content) {
            return res.status(400).json({ error: 'Se requiere llenar toda la informacion' });
        }

        const collection = db.collection('posts');
        const result = await collection.insertOne({ title, content });
        res.status(200).send({
            title: title,
            content: content,
            message: "Post Creado exitosamente"
        })

    }catch(e){
        res.status(401).send({
            error: e.message
        });
    }
});

app.get("/listPost", async(req,res) =>{
    try{
        const collection = db.collection('posts');
        const lista = await collection.find().toArray();
        res.status(200).send({
            message: "Post: \n" + lista
        })

    }catch(e){
        res.status(401).send({
            error: e.message
        });
    }
});




