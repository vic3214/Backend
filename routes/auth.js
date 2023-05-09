const { Router } = require("express");
const { check } = require("express-validator");
const {
  recuperarImagen,
  crearUsuario,
  revalidarToken,
  loginUsuario,
  borrarUsuario,
  crearRestaurante,
  borrarRestaurante,
  editarUsuario,
  editarRestaurante,
  getRestaurantes,
  subirImagen,
  getRestaurantesPorCiudadYNombre,
  buscarUbicacionDesdeCiudad,
  obtenerDatosToken,
  getRestaurantePorId,
  getUsuarioPorId,
  obtenerDatosTokenRestaurante,
  revalidarTokenRestaurante,
  loginRestaurante,
  editarPasswordRestaurante,
} = require("../controllers/auth");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();
//? Métodos http para usuarios

// Put para editar usuario
router.put(
  "/editar-usuario/:id",
  [
    validarJWT,
    check("nombre", "El nombre no debe estar vacío").not().isEmpty(),
    check(
      "email",
      "El email es obliatorio y debe estar bien formado"
    ).isEmail(),
    validarCampos,
  ],
  editarUsuario
);

// Post para crear un nuevo usuario
router.post(
  "/nuevo-usuario",
  [
    check("nombre", "El nombre no debe estar vacío").not().isEmpty(),
    check(
      "email",
      "El email es obliatorio y debe estar bien formado"
    ).isEmail(),
    check("password", "La contraseña es obligatoria").isLength({ min: 6 }), // isStrongPassword
    check("listaRestaurantesFavoritos", "Se debe intoducir un array vacío")
      .isArray()
      .isEmpty(),
    check("listaOpiniones", "Se debe intoducir un array vacío")
      .isArray()
      .isEmpty(),
    check("fechaNacimiento", "La fecha de nacimiento no puede estar vacía")
      .not()
      .isEmpty(),
    //Comprobamos errores en la request con el middleware
    validarCampos,
  ],
  crearUsuario
);

// Login de usuario
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").not().isEmpty(),
    check("email", "El email debe estar bien formado").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(), // isStrongPassword
    //Comprobamos errores en la request con el middleware
    validarCampos,
  ],
  loginUsuario
);

// Login restaurante
router.post(
  "/login-restaurante",
  [
    check("email", "El email es obligatorio").not().isEmpty(),
    check("email", "El email debe estar bien formado").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(), // isStrongPassword
    //Comprobamos errores en la request con el middleware
    validarCampos,
  ],
  loginRestaurante
);

// Borrar cuenta usuario
router.delete("/borrar-usuario/:id", validarJWT, borrarUsuario);

//? Métodos http para restaurantes

// Post para crear un nuevo restaurante
router.post(
  "/nuevo-restaurante",
  [
    check("nombre", "El nombre no debe estar vacío").not().isEmpty(),
    check("carta", "La carta no debe estar vacía").not().isEmpty(),
    check("horario", "El horario no debe estar vacío").not().isEmpty(),
    check(
      "comentarios",
      "Los comentarios deben ser un array vacío para un nuevo restaurante"
    )
      .isArray()
      .isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("email", "El email debe estar bien formado").isEmail(),
    check("ubicacion", "La ubicación no debe estar vacía").not().isEmpty(),
    check("tematica", "La tematica no debe estar vacía").not().isEmpty(),
    //Comprobamos errores en la request con el middleware
    validarCampos,
  ],
  crearRestaurante
);

// Put para editar restaurante
router.put("/editar-restaurante/:id", editarRestaurante);

router.put(
  "/editar-password-restaurante/:id",
  validarJWT,
  editarPasswordRestaurante
);

// Get para obtener los restaurantes (tiene filtros)
router.get("/restaurantes/:nombre/:ciudad", getRestaurantesPorCiudadYNombre);

// Get para obtener ciudad a partir de ubicacion
router.get("/restaurantes/:ciudad", buscarUbicacionDesdeCiudad);

// Get para obtener todos los restaurantes
router.get("/restaurantes", getRestaurantes);

router.get("/restaurante/:id", getRestaurantePorId);

router.get("/usuario/:id", getUsuarioPorId);

// Delete para borrar restaurante
router.delete("/borrar-restaurante/:id", validarJWT, borrarRestaurante);

//? Métodos http para funcionamiento interno de la aplicación

// Validar y renovar token
router.get("/auth/renovar", validarJWT, revalidarToken);

// Validar token restaurante
router.get("/auth/renovar-restaurante", validarJWT, revalidarTokenRestaurante);

// Obtener datos a partir del token
router.get("/auth/obtener-datos", validarJWT, obtenerDatosToken);

router.get(
  "/auth/obtener-datos-restaurante",
  validarJWT,
  obtenerDatosTokenRestaurante
);

// Subir imagen
router.post("/subir-imagen", [], subirImagen);

// Recuperar imagen
router.get("/recuperar-imagen/:id", recuperarImagen);

// Exportamos el módulo
module.exports = router;
