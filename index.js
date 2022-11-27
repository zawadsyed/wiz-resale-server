const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-01.qwgvzig.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('wizResale').collection('categories');
        const productCollection = client.db('wizResale').collection('products');
        const userCollection = client.db('wizResale').collection('users');


        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = categoryCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        })
        app.get('/categories/:name', async (req, res) => {
            const name = req.params.name;
            const query = { category_name: name };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/users', async (req, res) => {
            let query = {};
            if (req.query.role) {
                query = {
                    role: req.query.role
                }
            }
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })


    }
    finally {

    }
}

run().catch(error => {
    console.log(error);
})


app.get('/', (req, res) => {
    res.send('Wiz Resale server is running');
})
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})


// dbUserWiz
// xGaMMRhMxx9XpFrE