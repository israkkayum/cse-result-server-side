const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5900;


// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.60ufn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ImageData');
        const imageCollection = database.collection('image');
        const usersCollection = database.collection('users');

        app.post('/image', async (req, res) => {
            console.log(req.files);
            const pic = req.files.image;
            const nameInfo = pic.name;
            const nameLength = nameInfo.length;
            const nameSlice = nameInfo.slice(3, nameLength-3);
            const name = nameSlice;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const image = { image: imageBuffer, email: name }
            const result = await imageCollection.insertOne(image);
            res.json(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // app.get('/image', async (req, res) => {
        //     const cursor = imageCollection.find({});
        //     const image = await cursor.toArray();
        //     res.json(image);
        // });

        app.get('/image/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = imageCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.delete('/image/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await imageCollection.deleteOne(query);
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