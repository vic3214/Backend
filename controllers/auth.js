// Importamos response para que nos aparezca el tipado en res
const { response } = require("express");
// Importamos el modelo de usuario
const Usuario = require("../models/Usuario");
// Importamos el modelo de restaurantes
const Restaurante = require("../models/Restaurante");
// Importamos bcrypt para encriptar la constraseña
const bcrypt = require("bcryptjs");
// Importamos la funcion para generar el json web token
const { generarJWT } = require("../helpers/jwt");
const { db } = require("../models/Restaurante");
const { default: mongoose } = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const multer = require("multer");
//Configuracion multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname);
  },
});

const upload = multer({ storage: storage });
exports.upload = upload.single("myFile");

//? Controladores usuario

// Controlador de alta de nuevo usuario
const crearUsuario = async (req, res = response) => {
  console.log("Creando usuario con req:");
  console.log(req.body);
  const { nombre, email, password } = req.body;

  try {
    // Verificar el email

    const usuario = await Usuario.findOne({ email: email });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un usuario con ese email",
      });
    }
    // Crear usuario con el modelo

    const usuarioDB = new Usuario(req.body);

    // Encriptar la contraseña

    const salt = bcrypt.genSaltSync();
    usuarioDB.password = bcrypt.hashSync(password, salt);

    // Generar el JWT (Json Web Tocken)

    const token = await generarJWT(usuarioDB.id, nombre);

    // Crear usuario de Base de datos

    await usuarioDB.save();

    // Generar la respuesta exitosa

    return res.status(201).json({
      ok: true,
      uid: usuarioDB.id,
      nombre,
      email,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
    });
  }
};
// Controlador para editar usuario
// TODO: Controlar en el usuario si viene la fotografía o no y en caso de que no asignar fotografia estandar
const editarUsuario = async (req, res = response) => {
  const _id = req.params.id;
  try {
    const usuarioDB = await Usuario.findById({ _id });

    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: `No se ha encontrado un usuario con el id ${_id}`,
      });
    }

    //? No se debe actualizar el campo google, lo sacamos de campos
    const { google, email, ...campos } = req.body;

    if (usuarioDB.email !== email) {
      const existeEmail = await Usuario.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe un usuario con ese email",
        });
      }
    }

    campos.email = email;

    //TODO: Validar token y comprobar si es el usuario correcto

    const passwordEncriptada = bcrypt.hashSync(
      campos.password,
      bcrypt.genSaltSync()
    );
    campos.password = passwordEncriptada;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(_id, campos, {
      new: true,
    });

    return res.status(200).json({
      ok: true,
      mag: "Usuario editado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      mag: "Error del sistema",
    });
  }
};

// Controlador de login de usuario
const loginUsuario = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const usuarioDB = await Usuario.findOne({ email: email });
    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "El correo o la contraseña no son correctos",
      });
    }

    // Confirmar si el password hace match
    const passwordValida = bcrypt.compareSync(password, usuarioDB.password);

    if (!passwordValida) {
      return res.status(400).json({
        ok: false,
        msg: "El correo o la contraseña no son correctos",
      });
    }

    // Generar JWT

    const token = await generarJWT(usuarioDB.id, usuarioDB.nombre);

    // Respuesta

    return res.json({
      ok: true,
      uid: usuarioDB.id,
      nombre: usuarioDB.nombre,
      email: usuarioDB.email,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
    });
  }
};

// Controlador para borrar usuario (borrado por id)
const borrarUsuario = async (req, res = response) => {
  const _id = req.params.id;
  try {
    const ususarioBD = await Usuario.findById(_id);
    if (!ususarioBD) {
      return res.status(404).json({
        ok: false,
        msg: `No existe un usuario con el id ${_id}`,
      });
    }

    await Usuario.findByIdAndDelete(_id);

    res.status(200).json({
      ok: true,
      msg: "Usuario borrado",
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: `No se ha podido borrar el usuario con id ${_id}`,
    });
  }
};

//? Controladores restaurante

// Controlador para crear un restaurante
const crearRestaurante = async (req, res = response) => {
  const {
    nombre,
    carta,
    horario,
    comentarios,
    ubicacion,
    tematica,
    valoracion,
    fotografias,
  } = req.body;

  try {
    // Verificar ubicacion

    const restaurante = await Restaurante.findOne({ ubicacion: ubicacion });

    if (restaurante) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un restaurante en la misma ubicación",
      });
    }
    // Crear restaurante con el modelo

    const restauranteDB = new Restaurante(req.body);

    // Generar el JWT (Json Web Tocken)

    const token = await generarJWT(restauranteDB.id, nombre);

    // Crear restaurante de Base de datos

    await restauranteDB.save();

    // Generar la respuesta exitosa

    return res.status(201).json({
      ok: true,
      uid: restauranteDB.id,
      nombre,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
    });
  }
};

// Controlador para editar un restaurante
const editarRestaurante = async (req, res) => {
  const _id = req.params.id;
  try {
    const restauranteDB = await Restaurante.findById({ _id });

    if (!restauranteDB) {
      return res.status(404).json({
        ok: false,
        msg: `No se ha encontrado un restaurante con el id ${_id}`,
      });
    }

    //? No se debe actualizar el campo google, lo sacamos de campos
    const { ubicacion, ...campos } = req.body;

    if (restauranteDB.ubicacion !== ubicacion) {
      const existeUbicacion = await Restaurante.findOne({ ubicacion });
      if (existeUbicacion) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe un usuario con ese email",
        });
      }
    }

    campos.ubicacion = ubicacion;

    //TODO: Validar token y comprobar si es el restaurante correcto

    const restauranteActualizado = await Restaurante.findByIdAndUpdate(
      _id,
      campos,
      {
        new: true,
      }
    );

    return res.status(200).json({
      ok: true,
      mag: "Restaurante editado correctamente",
      restaurante: restauranteActualizado,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      mag: "Error del sistema",
    });
  }
};

// Controlador para obtener los restaurantes
const getRestaurantes = async (req, res) => {
  try {
    const restaurantes = await Restaurante.find({});
    if (!restaurantes) {
      return res.status(404).json({
        ok: false,
        msg: "No se han encontrado restaurantes",
      });
    }
    return res.status(200).json({
      ok: true,
      msg: "Restaurantes obtenidos",
      restaurantes: restaurantes,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error en el sistema",
    });
  }
};

// Controlador para obtener restaurantes a partir de un nombre
const getRestaurantePorNombre = async (req, res) => {
  const nombre = req.params.nombre;
  try {
    const restauranteBD = await Restaurante.find({
      nombre: { $regex: nombre, $options: "i" },
    });
    if (!restauranteBD) {
      return res.status(404).json({
        ok: false,
        msg: `No existe un restaurante con el nombre ${nombre}`,
      });
    }

    res.status(200).json({
      ok: true,
      restaurante: restauranteBD,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: `No se ha podido obtener el restaurante con nombre ${nombre}`,
    });
  }
};

// Controlador para borrar un restaurante (borra por id)
const borrarRestaurante = async (req, res) => {
  const _id = req.params.id;
  try {
    const restauranteBD = await Restaurante.findById(_id);
    if (!restauranteBD) {
      return res.status(404).json({
        ok: false,
        msg: `No existe un restaurante con el id ${_id}`,
      });
    }

    await Restaurante.findByIdAndDelete(_id);

    res.status(200).json({
      ok: true,
      msg: "Restaurante borrado",
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: `No se ha podido borrar el restaurante con id ${_id}`,
    });
  }
};
//? Controladores de la aplicación

// Controlador de renovación y validación de token
const revalidarToken = async (req, res) => {
  const { uid, nombre } = req;

  const token = await generarJWT(uid, nombre);

  return res.json({
    ok: true,
    uid: uid,
    nombre: nombre,
    token: token,
  });
};

const subirImagen = async (req, res) => {
  const imagen_base64 = req.body.imagen;
  const imagen_bytes = Buffer.from(imagen_base64, "base64");

  const client = new MongoClient(
    "mongodb+srv://VictorCaballeroTFG:baseDeDatos112@basededatostfg.gjhvq.mongodb.net/basededatos",
    {
      useNewUrlParser: true,
    }
  );
  await client.connect();

  const db = client.db("basededatos");
  const coleccion = db.collection("Imagenes");

  let idImagen;
  const result = await coleccion.insertOne({ imagen: imagen_bytes });
  idImagen = result.insertedId;
  client.close();

  return res.json({
    ok: true,
    msg: "Imagen subida",
    resultado: result,
    idImagen: idImagen,
  });
};

module.exports = {
  crearUsuario,
  editarUsuario,
  loginUsuario,
  borrarUsuario,
  crearRestaurante,
  editarRestaurante,
  getRestaurantes,
  borrarRestaurante,
  revalidarToken,
  subirImagen,
  getRestaurantePorNombre,
};
