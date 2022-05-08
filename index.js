const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express()

// middleware
app.use(cors());
app.use(express.json());


//deploy to heroku
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdqpx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('cycleWarehouse').collection('items');
        const orderCollection = client.db('cycleWarehouse').collection('order');
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.send(item);
        })
        //put
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const updateItems = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updateItems.Quantity
                }
            };

            const result = await itemsCollection.updateOne(filter, updatedDoc, options);
            const answer = await itemsCollection.findOne(filter);
            res.send(answer);
        })

        //post
        app.post('/items', async (req, res) => {
            const newItems = req.body;
            const result = await itemsCollection.insertOne(newItems);
            res.send(result)
        })

        //delete
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })
        //order collection api
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })
        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.send(order);
        });




    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('warehouse server worked')
})

app.listen(port, () => console.log('port worked'));