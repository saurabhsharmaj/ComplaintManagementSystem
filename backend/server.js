const express = require('express');
const cors = require('cors');
const mongoose =require('mongoose');

require('dotenv').config();
const app=express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://ersaurabhsharmamca:SUXVZQUyUW5X2qI3@gatepass-db.alvtd.mongodb.net/complaint-management-db?retryWrites=true&w=majority&appName=complaint-management-db";
mongoose.connect(uri, { useNewUrlParser: true,
  useUnifiedTopology: true }
    );
const connection = mongoose.connection;
connection.once('open', () => {
    console.log(uri);
})

const usersRouter = require('./routes/users');
const apiRoutes = require("./routes/api");

app.use('/users', usersRouter);
app.use("/api", apiRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client','build','index.html'));
    });
} 

app.listen(port, () => {
    console.log( 'ser ver is running on port: ${port} ')
})