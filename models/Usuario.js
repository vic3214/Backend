const { Schema, model } = require("mongoose");

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
    type: String,
  },
  listaOpiniones: {
    type: [String],
    required: true,
  },
  fechaNacimiento: {
    type: String,
    required: true,
  },
  reservas: {
    type: [
      {
        uidReserva: String,
        uidRestaurante: String,
        uidUsuario: String,
        nombre: String,
        personas: Number,
        hora: String,
        fecha: Date,
      },
    ],
    required: true,
  },
});

module.exports = model("Usuario", UsuarioSchema);

//? Modelos de la base de datos
