const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.np7fjqr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    client.connect();

    const toysCollection = client.db('toyDB').collection('toys');

    app.get('/allToys', async (req, res) => {
        const result = await toysCollection.find({}).toArray();
        res.send(result);
    })
    app.get('/allToys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.findOne(query);
        res.send(result);
    })
    app.get('/allToy/:category', async (req, res) => {
        const category = req.params?.category;
        let query = {}
        if (category) {
            query = { category: category };
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result);
    })
    app.get('/myToys', async (req, res) => {
        const email = req.query.email;
        let query = {}
        if(email) {
            query = { email: email };
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result);
    })

    app.post('/addToy', async (req, res) => {
        const toys = req.body;
        const result = await toysCollection.insertOne(toys);
        res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})