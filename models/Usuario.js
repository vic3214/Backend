const { Schema, model } = require("mongoose");
const Restaurante = require("../models/Restaurante");

const UsuarioSchema = Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  listaRestaurantesFavoritos: {
    type: [String],
    required: true,
  },
  fotografia: {
    // Cadena con el id de la fotografia
    type: String,
  },
  listaOpiniones: {
    //FIXME: Incluir valoraciones?
    type: [String],
    required: true,
  },
  fechaNacimiento: {
    //? Formato de fecha 'año-mes-dia' EJ: '1999-04-11'
    type: Date,
    required: true,
  },
  google: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("Usuario", UsuarioSchema);

//? Modelos de la base de datos
