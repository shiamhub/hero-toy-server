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
    // client.connect();

    const toysCollection = client.db('toyDB').collection('toys');

    const indexKeys = { name: 1 };
    const indexOptions = {
      name: 'name'
    };
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get('/allToys', async (req, res) => {
      const result = await toysCollection.find({}).limit(20).toArray();
      res.send(result);
    })
    app.get('/pageAllToys', async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 6;
      const skip = page * limit;

      const result = await toysCollection.find({}).skip(skip).limit(limit).toArray();
      res.send(result);
    })
    app.get('/totalToys', async (req, res) => {
      const result = await toysCollection.estimatedDocumentCount();
      res.send({
        totalToys: result
      })
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
      if (email) {
        query = { email: email };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/myToysSortByAscending', async (req, res) => {
      const email = req.query.email;
      let query = {}
      if (email) {
        query = { email: email };
      }
      const result = await toysCollection.find(query).sort({ price: 1 }).toArray();
      res.send(result);
    })
    app.get('/myToysSortByDescending', async (req, res) => {
      const email = req.query.email;
      let query = {}
      if (email) {
        query = { email: email };
      }
      const result = await toysCollection.find(query).sort({ price: -1 }).toArray();
      res.send(result);
    })



    app.get('/updateMyToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    })
    app.get('/searchAllToys/:searchText', async (req, res) => {
      const text = req.params.searchText;
      const result = await toysCollection.find({
        $or: [
          { name: { $regex: text, $options: 'i' } }
        ]
      }).toArray();
      res.send(result);
    })

    app.post('/addToy', async (req, res) => {
      const toys = req.body;
      const result = await toysCollection.insertOne(toys);
      res.send(result);
    })
    app.put('/updateMyToy/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToy = req.body;
      const update = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          description: updateToy.description
        }
      }
      const result = await toysCollection.updateOne(query, update, options);
      res.send(result);
    })

    app.delete('/deleteToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    // client.db("admin").command({ ping: 1 });
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