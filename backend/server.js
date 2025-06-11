const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://ersaurabhsharmamca:SUXVZQUyUW5X2qI3@gatepass-db.alvtd.mongodb.net/complaint-management-db?retryWrites=true&w=majority&appName=complaint-management-db";
mongoose.connect(uri).then(() => {
    console.log("db connection successful.");
}).catch((err) => {
    if (err.EREFUSED) {
        console.log("check your internet connection!")
    } else {
        console.log("unable to connect with database!", err)
    }
})




const apiRoutes = require("./routes/api");

app.use("/api", apiRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})