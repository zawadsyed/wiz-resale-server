const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-01.qwgvzig.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const categoryCollection = client.db('wizResale').collection('categories');
        const productCollection = client.db('wizResale').collection('products');
        const userCollection = client.db('wizResale').collection('users');


        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }


        const verifySeller = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        app.get('/categorytitle', async (req, res) => {
            const query = {}
            const result = await categoryCollection.find(query).project({ category_title: 1 }).toArray();
            res.send(result);
        })

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

        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
            const query = {
                role: req.query.role,
            }
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user.role === 'admin' })
        })
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user.role === 'seller' })
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            res.send({ isBuyer: user.role === 'buyer' })
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            console.log(user);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.delete('/users/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/my-products', verifyJWT, verifySeller, async (req, res) => {
            const query = {
                seller_email: req.query.email,
            }
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.delete('/my-products/:id', verifyJWT, verifySeller, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(filter);
            res.send(result);
        })

        app.post('/products', verifyJWT, verifySeller, async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log(result)
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