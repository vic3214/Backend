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
          nombre: String,
          precio: Number,
        },
      ],
      primerosPlatos: [
        {
          nombre: String,
          precio: Number,
        },
      ],
      segundosPlatos: [
        {
          nombre: String,
          precio: Number,
        },
      ],
      postres: [
        {
          nombre: String,
          precio: Number,
        },
      ],
      bebidas: [
        {
          nombre: String,
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
  comentarios: {
    type: [String],
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
