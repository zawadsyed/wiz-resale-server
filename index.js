const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = categoryCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
            console.log(categories)
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