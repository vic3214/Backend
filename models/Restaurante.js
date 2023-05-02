const { Schema, model } = require("mongoose");

//FIXME: Incluir estadisticas?
const RestauranteSchema = Schema({
  nombrePropietario: {
    type: String,
    required: true,
  },
  fechaNacimiento: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  ubicacion: {
    type: [Number],
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  carta: {
    type: {
      entrantes: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
        },
      ],
      primerosPlatos: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
        },
      ],
      segundosPlatos: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
        },
      ],
      postres: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
        },
      ],
      bebidas: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
        },
      ],
    },
    required: true,
  },
  horario: {
    type: [
      {
        dias: [String],
        horas: [String],
      },
    ],
    required: true,
  },
  reservas: {
    type: [
      {
        usuario: String,
        personas: Number,
        hora: String,
        fecha: Date,
      },
    ],
    required: true,
  },
  comentarios: {
    type: [
      {
        usuario: String,
        comentario: String,
      },
    ],
  },
  tematica: {
    type: String,
    required: true,
  },
  valoracion: {
    type: [
      {
        usuario: String,
        voto: Number,
      },
    ],
    required: true,
  },
  fotografia: {
    type: String,
    required: false,
  },
});

module.exports = model("Restaurante", RestauranteSchema);
