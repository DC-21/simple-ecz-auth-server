const Sequelize = require('sequelize');
const db = require('../Utils/db');

const User = db.define('User', {
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull:false,
    },
    email:{
        type:Sequelize.STRING,
        allowNull: false,
        required:true,
        unique:true,
    },
    password:{
        type:Sequelize.STRING,
        allowNull: false,
    }
})

module.exports = User;