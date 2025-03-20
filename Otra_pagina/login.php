<?php

var_dump($_POST);

include("abrir_conexion.php"); 

// Verificar la conexión 

if ($conn->connect_error) { 

    die("Error de conexión a la base de datos: " . $conn->connect_error); 

} 


// Obtener usuario y contraseña
$user = $_POST['user'];
$contrasena = $_POST['contrasena'];


$contrasena_encriptada = hash('sha256', $contrasena);

echo "Datos obtenidos correctamente ". $contrasena_encriptada. "usuario" . $user ."";

// Consultar la base de datos para obtener la contraseña encriptada del usuario
$query = mysqli_query($conn,"SELECT password FROM usuarios WHERE username = '$user' and password = '$contrasena_encriptada'");


$affectedRows = mysqli_affected_rows($conn);

if ($affectedRows == 1){



    // La contraseña es correcta, iniciar sesión y redirigir a index.php


    echo "Sesion iniciada";
    // Retrieve user's name from the database
    $userNameQuery = mysqli_query($conn, "SELECT name FROM usuarios WHERE username = '$user'");
    echo "Sesion iniciada1";
    $userInfo = mysqli_fetch_assoc($userNameQuery);
    echo "Sesion iniciada2";
    $userName = $userInfo['name'];
    

    session_start();

    // Store username in a session variable
    $_SESSION['username'] = $userName;
    
    $_SESSION['loggedin'] = true;
    header('Location: index.php');
    exit;
} else {
    // Mostrar un mensaje de error
    echo 'Usuario o contraseña incorrectos';
}

// Cerrar la conexión
$stmt->close();
$mysqli->close();

?>
