const { Schema, model } = require("mongoose");

//FIXME: Incluir estadisticas?
const RestauranteSchema = Schema({
  nombre: {
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
    type: String,
    required: true,
  },
  comentarios: {
    type: [String],
  },
  ubicacion: {
    type: [Number],
    required: true,
    unique: true,
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
    required: true,
  },
});

module.exports = model("Restaurante", RestauranteSchema);
