const express = require('express');
const cors = require('cors');
const sequelize = require('./Utils/db.js');
const bodyParser=require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use('/',require('./routes/router'))

app.use((err, red, res, next)=>{
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    res.status(status).json({ message: message });
});

app.get('/',(req,res)=>{
    res.send("The api is working");
})

sequelize.sync().then(()=>{
    console.log("Database successfully connected");
    app.listen(3000)
    console.log("App listening on http://localhost:3000");
}).catch(err=>{
    console.log(err);
});