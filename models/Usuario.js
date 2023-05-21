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
    //FIXME: Incluir valoraciones?
    type: [String],
    required: true,
  },
  fechaNacimiento: {
    //? Formato de fecha 'año-mes-dia' EJ: '1999-04-11'
    // FIXME: Asignar formato de fecha correctamente en calendario y asignar tipo Date
    type: String,
    required: true,
  },
  reservas: {
    type: [
      {
        uidReserva: String,
        uidRestaurante: String,
        uidUsuario: String,
        usuario: String,
        personas: Number,
        hora: String,
        fecha: Date,
        estado: Boolean,
      },
    ],
    required: true,
  },
});

module.exports = model("Usuario", UsuarioSchema);

//? Modelos de la base de datos
