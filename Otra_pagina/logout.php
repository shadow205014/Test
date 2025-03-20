<?php
session_start();
$_SESSION['loggedin'] = false;
// Destruir la sesión
session_destroy();

// Redireccionar a la página de inicio de sesión
header('Location: index.php');
exit;
?>