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
          fotografiaPlato: String,
        },
      ],
      primerosPlatos: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
          fotografiaPlato: String,
        },
      ],
      segundosPlatos: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
          fotografiaPlato: String,
        },
      ],
      postres: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
          fotografiaPlato: String,
        },
      ],
      bebidas: [
        {
          nombrePlato: String,
          precio: Number,
          tipo: String,
          fotografiaPlato: String,
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
  maximoPersonasPorHora: {
    type: Number,
    required: false,
  },
  maximoPersonasPorReserva: {
    type: Number,
    required: false,
  },
  vecesReservado: {
    type: Number,
    required: true,
  },
  vecesVisitado: {
    type: Number,
    required: true,
  },
});

module.exports = model("Restaurante", RestauranteSchema);
