const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sn9xggj.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const roommatesCollection = client.db('roommateFinder').collection('roommate');


        // app.post('/roommate', async (req, res) => {
        //     const roommateData = req.body;
        //     const result = await roommatesCollection.insertOne(roommateData);
        //     res.send(result);
        // });

        //         app.get('/roommate', async (req, res) => {
        //     try {
        //         const featuredRoommates = await roommatesCollection
        //             .find({ availability: "Available" }) 
        //             .toArray();
        //         res.send(featuredRoommates);
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).send({ error: "Server error" });
        //     }
        // });


        //
        app.patch("/roommate/like/:id", async (req, res) => {
            const id = req.params.id;
            const { userEmail } = req.body;

            const filter = { _id: new ObjectId(id) };
            const post = await roommatesCollection.findOne(filter);

            if (post.userEmail === userEmail) {
                return res.status(403).send({ message: "You cannot like your own post" });
            }

            const updateDoc = {
                $inc: { likeCount: 1 }
            };

            const result = await roommatesCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        //

        app.post('/roommate', async (req, res) => {
            const roommateData = req.body;
            if (!roommateData.userEmail) {
                return res.status(400).send({ error: 'userEmail is required' });
            }
            const result = await roommatesCollection.insertOne(roommateData);
            res.send(result);
        });

        app.get("/featured-roommates", async (req, res) => {
            const query = {
                availability: { $in: ["Available", true] }
            };

            const result = await roommatesCollection
                .find(query)
                .limit(6)
                .toArray();
            res.send(result);
        });





        app.get('/roommate', async (req, res) => {
            try {
                const cursor = roommatesCollection.find();
                const roommates = await cursor.toArray();
                res.send(roommates);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        app.get('/roommate/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roommatesCollection.findOne(query);
            res.send(result);
        })

        app.get('/roommate', async (req, res) => {
            const roommates = await roommatesCollection.find().toArray();
            res.send(roommates);
        });




        
        app.get('/roommate', async (req, res) => {
            const userEmail = req.query.email;
            if (!userEmail) return res.send([]);
            const result = await roommatesCollection.find({ userEmail }).toArray();
            res.send(result);
        });



        app.get("/roommate-by-email", async (req, res) => {
            const email = req.query.email;
            if (!email) {
                return res.status(400).send({ message: "Email required" });
            }

            const query = { userEmail: email };
            const result = await roommatesCollection.find(query).toArray();
            res.send(result);
        });


        // app.delete("/roommates/:id", async (req, res) => {
        //   const id = req.params.id;
        //   const result = await roommatesCollection.deleteOne({ _id: new ObjectId(id) });
        //   res.send(result);
        // });




        //

        app.put('/roommate/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateRoommate = req.body;
            const updateDoc = {
                $set: updateRoommate,
            }

            const result = await roommatesCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result)
        })

        app.delete("/roommate/:id", async (req, res) => {
            const id = req.params.id;
            const result = await roommatesCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('roommate finder running,')
})

app.listen(port, () => {
    console.log(`roommate finder running on port ${port}`);
})

