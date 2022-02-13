const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

var serviceAccount = require("./permissions.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://events-near-us.firebaseio.com"
});
const db = admin.firestore();

// create
app.post('/api/create', (req, res) => {
    (async () => {
        try {
            await db.collection('events').doc('/' + req.body.id + '/').create({event: req.body.event});
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
      })();
  });

// read event
app.get('/api/read/:event_id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('events').doc(req.params.event_id);
            let event = await document.get();
            let response = event.data();
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        })();
    });

// read all
app.get('/api/read', (req, res) => {
    (async () => {
        try {
            let query = db.collection('events');
            let response = [];
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedevent = {
                        id: doc.id,
                        event: doc.data().event
                    };
                    response.push(selectedevent);
                }
                return response;
            });
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        })();
    });

// update
app.put('/api/update/:event_id', (req, res) => {
(async () => {
    try {
        const document = db.collection('events').doc(req.params.event_id);
        await document.update({
            event: req.body.event
        });
        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

// delete
app.delete('/api/delete/:event_id', (req, res) => {
(async () => {
    try {
        const document = db.collection('events').doc(req.params.event_id);
        await document.delete();
        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

exports.app = functions.https.onRequest(app);
