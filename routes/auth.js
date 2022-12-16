const { Router } = require("express");
const { check } = require("express-validator");
const {
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
    check("ubicacion", "La ubicación no debe estar vacía").not().isEmpty(),
    check("tematica", "La tematica no debe estar vacía").not().isEmpty(),
    check("valoracion", "La valoracion no debe estar vacía").not().isEmpty(),
    check("fotografias", "Debe haber al menos una fotografía ").not().isEmpty(),
    //Comprobamos errores en la request con el middleware
    validarCampos,
  ],
  crearRestaurante
);

// Put para editar restaurante
router.put("/editar-restaurante/:id", validarJWT, editarRestaurante);

// Get para obtener los restaurantes (tiene filtros)
router.get("/restaurantes", getRestaurantes);

// Delete para borrar restaurante
router.delete("/borrar-restaurante/:id", validarJWT, borrarRestaurante);

//? Métodos http para funcionamiento interno de la aplicación

// Validar y renovar token
router.get("/auth/renovar", validarJWT, revalidarToken);

// Subir imagen
router.post("/subir-imagen", [], subirImagen);

// Exportamos el módulo
module.exports = router;
