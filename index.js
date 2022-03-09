const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5700;


// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4c1ex.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ResultSheet');
        const resultCollection = database.collection('1Y1S');

        app.get('/1Y1S/:roll', async (req, res) => {
            const roll = req.params.roll;
            const query = { roll: roll };
            const result = await resultCollection.findOne(query);
            res.json(result);
        });

        app.get('/1Y1S', async (req, res) => {
            const cursor = resultCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

    }

    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ema jon server is running and running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
});