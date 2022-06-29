//importar el archivo de server, se ace de está forma
var app = require("./server")
const dotenv = require('dotenv')

dotenv.config();
const port = process.env.NODE_ENV=== 'dev' ? (process.env.PORT || 80): 5000;
app.listen(port,()=> console.log("servidor funcionando en el puerto" + port ))