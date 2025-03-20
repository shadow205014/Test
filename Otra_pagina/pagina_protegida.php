<?php
session_start();

if (isset($_SESSION['id_usuario'])) {
  echo "Inicio de sesión exitoso.";
  // Código de la página protegida
} else {
  header("Location: login.php");
  exit;
}
?>