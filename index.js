const express = require('express');
const cors = require('cors');
const sequelize = require('./Utils/db.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/users',require('./routes/router.js'))

app.use((err, red, res, next)=>{
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    res.status(status).json({ message: message });
});

sequelize.sync().then(()=>{
    console.log("Database successfully connected");
    app.listen(3000)
    console.log("App listening on http://localhost:3000");
}).catch(err=>{
    console.log(err);
});