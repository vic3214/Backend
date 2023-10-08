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
const { ObjectId } = require("mongodb");
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

//? Para obtener ciudad a partir de ubicacion

const upload = multer({ storage: storage });
exports.upload = upload.single("myFile");

//? Controladores usuario

// Controlador de alta de nuevo usuario
const crearUsuario = async (req, res = response) => {
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
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
    });
  }
};
// Controlador para editar usuario
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
    const { email, password, ...campos } = req.body;
    if (usuarioDB.email !== email) {
      const existeEmail = await Usuario.findOne({ email });
      if (existeEmail && usuarioDB.email != email) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe un usuario con ese email",
        });
      }
    }
    campos.email = email;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(_id, campos, {
      new: false,
    });

    // Enviar correo si se elimina una reserva a un usuario
    if (req.body.reservas) {
      const reservasAntiguas = usuarioDB.reservas;
      const reservasNuevas = campos.reservas;

      //Convierte la fecha de reservas antiguas a cadena
      for (let i = 0; i < reservasAntiguas.length; i++) {
        reservasAntiguas[i].fecha = reservasAntiguas[i].fecha.toString();
      }

      console.log("reservasAntiguas", reservasAntiguas);
      console.log("reservasNuevas", reservasNuevas);

      for (let i = 0; i < reservasAntiguas.length; i++) {
        if (
          !reservasNuevas.some(
            (reservaNueva) =>
              reservaNueva.uidReserva === reservasAntiguas[i].uidReserva
          ) &&
          reservasAntiguas.length > reservasNuevas.length
        ) {
          const restauranteDB = await Restaurante.findById(
            reservasAntiguas[i].uidRestaurante
          );
          const email = usuarioActualizado.email;
          const nombre = usuarioActualizado.nombre;
          const restaurante = restauranteDB.nombre;
          const fecha = usuarioActualizado.reservas[i].fecha;

          const dia = fecha.getDate();

          const mes = fecha.getMonth() + 1;

          const mesEspanol =
            mes === 1
              ? "Enero"
              : mes === 2
              ? "Febrero"
              : mes === 3
              ? "Marzo"
              : mes === 4
              ? "Abril"
              : mes === 5
              ? "Mayo"
              : mes === 6
              ? "Junio"
              : mes === 7
              ? "Julio"
              : mes === 8
              ? "Agosto"
              : mes === 9
              ? "Septiembre"
              : mes === 10
              ? "Octubre"
              : mes === 11
              ? "Noviembre"
              : "Diciembre";

          console.log(restauranteDB.reservas[i]);
          const hora = restauranteDB.reservas[i].hora;
          const asunto = "Reserva cancelada";
          const mensaje = `Hola ${nombre}, lamentamos informarte de que tu reserva en el restaurante ${restaurante} para el día ${dia} de ${mesEspanol} a las ${hora} ha sido cancelada. Sentimos las molestias.`;

          const nodemailer = require("nodemailer");

          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "lacucharapruebaservices@gmail.com",
              pass: "nmnx mfoh psmd jyhc",
            },
          });
          //lacucharapruebaservices11

          let mailOptions = {
            from: '"La cuchara 🥄 " <lacucharapruebaservices@gmail.com>',
            to: email,
            subject: asunto,
            text: mensaje,
          };

          console.log("Enviando...");

          transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
              console.log("Error occurs", err);
            } else {
              console.log("Email sent!!!");
            }
          });
        }
      }
    }

    return res.status(200).json({
      ok: true,
      msg: "Usuario editado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
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

    return res.json({
      ok: true,
      uid: usuarioDB.id,
      nombre: usuarioDB.nombre,
      email: usuarioDB.email,
      reservas: usuarioDB.reservas,
      favoritos: usuarioDB.listaRestaurantesFavoritos,
      fechaNacimiento: usuarioDB.fechaNacimiento,
      opiniones: usuarioDB.listaOpiniones,
      token,
    });
  } catch (error) {
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

const getUsuarioPorId = async (req, res) => {
  const _id = req.params.id;

  try {
    const usuarioBD = await Usuario.findById(_id);

    if (usuarioBD != null) {
      return res.status(200).json({
        ok: true,
        usuario: usuarioBD,
      });
    } else {
      return res.status(404).json({
        ok: false,
        msg: `No se ha podido obtener el usuario con id ${_id}`,
        error: error,
      });
    }
  } catch (error) {
    return res.status(404).json({
      ok: false,
      msg: `No se ha podido obtener el usuario con id ${_id}`,
      error: error,
    });
  }
};

//? Controladores restaurante

// Controlador de login de usuario
const loginRestaurante = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const restauranteDB = await Restaurante.findOne({ email: email });

    if (!restauranteDB) {
      return res.status(404).json({
        ok: false,
        msg: "El correo o la contraseña no son correctos",
      });
    }

    // Confirmar si el password hace match
    const passwordValida = bcrypt.compareSync(password, restauranteDB.password);

    if (!passwordValida) {
      return res.status(400).json({
        ok: false,
        msg: "El correo o la contraseña no son correctos",
      });
    }

    // Generar JWT
    const token = await generarJWT(restauranteDB.id, restauranteDB.nombre);

    return res.json({
      ok: true,
      uid: restauranteDB.id,
      nombre: restauranteDB.nombre,
      email: restauranteDB.email,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
    });
  }
};

// Controlador para crear un restaurante
const crearRestaurante = async (req, res = response) => {
  const { nombre, ubicacion, password } = req.body;

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
    // Encriptamos constraseña
    const salt = bcrypt.genSaltSync();
    restauranteDB.password = bcrypt.hashSync(password, salt);

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

    const { ubicacion, password, fotografia, ...campos } = req.body;

    if (restauranteDB.ubicacion.join() !== ubicacion.join()) {
      const existeUbicacion = await Restaurante.findOne({ ubicacion });
      if (existeUbicacion) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe un restaurante con esa ubicacion",
        });
      }
    }

    const restauranteActualizado = await Restaurante.findByIdAndUpdate(
      _id,
      campos,
      {
        new: true,
      }
    );

    return res.status(200).json({
      ok: true,
      msg: "Restaurante editado correctamente",
      restaurante: restauranteActualizado,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
    });
  }
};

const editarPasswordRestaurante = async (req, res) => {
  const _id = req.params.id;
  try {
    const restauranteDB = await Restaurante.findById({ _id });

    if (!restauranteDB) {
      return res.status(404).json({
        ok: false,
        msg: `No se ha encontrado un restaurante con el id ${_id}`,
      });
    }

    const { ubicacion, password, ...campos } = req.body;

    const salt = bcrypt.genSaltSync();
    campos.password = bcrypt.hashSync(password, salt);

    const restauranteActualizado = await Restaurante.findByIdAndUpdate(
      _id,
      campos,
      {
        new: true,
      }
    );

    return res.status(200).json({
      ok: true,
      msg: "Restaurante editado correctamente",
      restaurante: restauranteActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error del sistema",
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

const buscarUbicacionDesdeCiudad = async (req, res) => {
  const ciudad = req.params.ciudad;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${ciudad}&countrycodes=es`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.length > 0) {
    return res.status(200).json({
      ok: true,
      latitud: data[0].lat,
      longitud: data[0].lon,
      nombre: data[0].display_name,
    });
  } else {
    return res.status(404).json({
      ok: false,
      msg: `No se ha encontrado ninguna ubicación para la ciudad de ${ciudad}`,
    });
  }
};

const determinarCiudadDesdeUbicacion = async (latitud, longitud) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitud}&lon=${longitud}`;

  const response = await fetch(url);
  const data = await response.json();
  if (data.address.city) {
    return data.address.city;
  } else {
    return data.address.village;
  }
};

// Controlador para obtener restaurantes a partir de un nombre
const getRestaurantesPorCiudadYNombre = async (req, res) => {
  const ciudad = req.params.ciudad;
  const nombre = req.params.nombre;

  try {
    let restaurantesBD;
    if (nombre === "Buscar todos") {
      restaurantesBD = await Restaurante.find();
    } else {
      restaurantesBD = await Restaurante.find({
        nombre: { $regex: nombre, $options: "i" },
      });
    }

    const restaurantesFiltrados = [];

    for (let i = 0; i < restaurantesBD.length; i++) {
      const latitud = restaurantesBD[i].ubicacion[0];
      const longitud = restaurantesBD[i].ubicacion[1];

      const ciudadRestauranteBD = await determinarCiudadDesdeUbicacion(
        latitud,
        longitud
      );

      if (
        ciudadRestauranteBD.toLowerCase() === ciudad.toLowerCase() ||
        ciudad.includes(ciudadRestauranteBD)
      ) {
        restaurantesFiltrados.push(restaurantesBD[i]);
      }
    }

    if (!restaurantesBD) {
      return res.status(404).json({
        ok: false,
        msg: `No existe un restaurante con el nombre ${nombre} en la ciudad de ${ciudad}`,
      });
    }

    return res.status(200).json({
      ok: true,
      restaurantes: restaurantesFiltrados,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: `No se ha podido obtener los restaurantes en la ciudad de ${ciudad}`,
      error: error,
    });
  }
};

// Controlador para obtener restaurante por id
const getRestaurantePorId = async (req, res) => {
  const _id = req.params.id;

  try {
    const restauranteBD = await Restaurante.findById(_id);

    if (restauranteBD != null) {
      return res.status(200).json({
        ok: true,
        restaurante: restauranteBD,
      });
    } else {
      return res.status(404).json({
        ok: false,
        msg: `No se ha podido obtener el restaurante con id ${_id}`,
        error: error,
      });
    }
  } catch (error) {
    return res.status(404).json({
      ok: false,
      msg: `No se ha podido obtener el restaurante con id ${_id}`,
      error: error,
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

    //Mandar correo a todos los usuarios que tienen reservas en el restaurante
    const reservas = restauranteBD.reservas;
    for (let i = 0; i < reservas.length; i++) {
      const usuarioDB = await Usuario.findById(reservas[i].uidUsuario);
      const email = usuarioDB.email;
      const nombre = usuarioDB.nombre;
      const restaurante = restauranteBD.nombre;
      const fecha = usuarioDB.reservas[i].fecha;

      const dia = fecha.getDate();

      const mes = fecha.getMonth() + 1;

      const mesEspanol =
        mes === 1
          ? "Enero"
          : mes === 2
          ? "Febrero"
          : mes === 3
          ? "Marzo"
          : mes === 4
          ? "Abril"
          : mes === 5
          ? "Mayo"
          : mes === 6
          ? "Junio"
          : mes === 7
          ? "Julio"
          : mes === 8
          ? "Agosto"
          : mes === 9
          ? "Septiembre"
          : mes === 10
          ? "Octubre"
          : mes === 11
          ? "Noviembre"
          : "Diciembre";

      const hora = restauranteBD.reservas[i].hora;
      const asunto = "Restaurante eliminado";
      const mensaje = `Hola ${nombre}, lamentamos informarte de que el restaurante ${restaurante} en el que tenías una reserva para el día ${dia} de ${mesEspanol} a las ${hora} ha sido eliminado de nuestra aplicación por lo que sus reservas han sido canceladas automáticamente. Sentimos las molestias.`;

      const nodemailer = require("nodemailer");

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "lacucharapruebaservices@gmail.com",
          pass: "nmnx mfoh psmd jyhc",
        },
      });

      let mailOptions = {
        from: '"La cuchara 🥄 " <lacucharapruebaservices@gmail.com>',
        to: email,
        subject: asunto,
        text: mensaje,
      };

      console.log("Enviando...");

      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          console.log("Error occurs", err);
        } else {
          console.log("Email sent!!!");
        }
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

  const usuarioDB = await Usuario.findById({ _id: uid });

  const token = await generarJWT(uid, nombre);

  return res.json({
    ok: true,
    uid: uid,
    email: usuarioDB.email,
    reservas: usuarioDB.reservas,
    favoritos: usuarioDB.listaRestaurantesFavoritos,
    nombre: nombre,
    token: token,
  });
};

// Controlador de renovación y validación de token
const revalidarTokenRestaurante = async (req, res) => {
  const { uid, nombre } = req;

  const restauranteDB = await Restaurante.findById({ _id: uid });

  const token = await generarJWT(uid, nombre);

  return res.json({
    ok: true,
    uid: uid,
    email: restauranteDB.email,
    nombre: nombre,
    token: token,
  });
};

const obtenerDatosTokenRestaurante = async (req, res) => {
  const uid = req.uid;

  const restauranteDB = await Restaurante.findById({ _id: uid });

  return res.json({
    ok: true,
    restaurante: restauranteDB,
  });
};

const obtenerDatosToken = async (req, res) => {
  const { uid, nombre } = req;

  const usuarioDB = await Usuario.findById({ _id: uid });

  return res.json({
    ok: true,
    uid: uid,
    email: usuarioDB.email,
    reservas: usuarioDB.reservas,
    favoritos: usuarioDB.listaRestaurantesFavoritos,
    nombre: nombre,
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

const recuperarImagen = async (req, res) => {
  const _id = req.params.id;
  const client = new MongoClient(
    "mongodb+srv://VictorCaballeroTFG:baseDeDatos112@basededatostfg.gjhvq.mongodb.net/basededatos",
    {
      useNewUrlParser: true,
    }
  );
  await client.connect();

  const db = client.db("basededatos");
  const coleccion = db.collection("Imagenes");

  let imagen;
  if (_id !== null && _id !== undefined && _id !== "null") {
    imagen = await coleccion.findOne({ _id: new ObjectId(_id) });
  } else {
    imagen = undefined;
  }

  if (!imagen) {
    res.status(404).send("Imagen no encontrada");
  } else {
    const imagen_base64 = imagen.imagen.toString("base64");
    res.json({ imagen: imagen_base64 });
  }
  client.close();
};

module.exports = {
  recuperarImagen,
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
  getRestaurantesPorCiudadYNombre,
  buscarUbicacionDesdeCiudad,
  obtenerDatosToken,
  getRestaurantePorId,
  getUsuarioPorId,
  loginRestaurante,
  obtenerDatosTokenRestaurante,
  revalidarTokenRestaurante,
  editarPasswordRestaurante,
};
