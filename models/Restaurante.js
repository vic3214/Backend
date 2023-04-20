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
        },
      ],
      primerosPlatos: [
        {
          nombrePlato: String,
          precio: Number,
        },
      ],
      segundosPlatos: [
        {
          nombrePlato: String,
          precio: Number,
        },
      ],
      postres: [
        {
          nombrePlato: String,
          precio: Number,
        },
      ],
      bebidas: [
        {
          nombrePlato: String,
          precio: Number,
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
        horario: String,
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
    type: Number,
    required: true,
  },
  fotografias: {
    type: [String],
    required: false,
  },
});

module.exports = model("Restaurante", RestauranteSchema);
