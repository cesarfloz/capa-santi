//importar la libreria principal se puede hacer de esta forma
var app = require("./server")
//libreria para manejo de variables
const dotenv = require('dotenv')

dotenv.config();
//si la variable node_env= 'env' entonces
const port = process.env.NODE_ENV=== 'dev' ? (process.env.PORT || 80): 5000;


app.listen(port,()=> console.log("servidor funcionando en el puerto: " + port ))