// Importamos el paquete express
const express = require("express");
// Importamos la funcion para la conexion a la base de datos
const { dbConnection } = require("./db/config");
// Para tamaño de las imagenes
const bodyParser = require("body-parser");

// Importamos cors
const cors = require("cors");
// Importamos variable de entorno desde dotenv
require("dotenv").config();

console.log(process.env);
// Creamos el servidor/aplicación de express
const app = express();

// Conexion a base de datos

dbConnection();

// Acceso directorio público
app.use(express.static("public"));

// Tamaño de las imagenes
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Cors
app.use(cors());

// Lectura y parseo del body
app.use(express.json());

// Rutas
app.use("/api", require("./routes/auth"));

// Escuchamos en el puerto 4000
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
