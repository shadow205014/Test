<?php 

// Conexión a la base de datos MySQL 

  

include("abrir_conexion.php"); 

// Verificar la conexión 

if ($conn->connect_error) { 

    die("Error de conexión a la base de datos: " . $conn->connect_error); 

} 

  

// Recibir datos del formulario 

$usr = $_POST['nombre_usuario']; 
$name = $_POST['Nombre'];
$email = $_POST['Email'];
$contrasena = $_POST['contrasena']; 

$contrasena_encriptada = hash('sha256', $contrasena); 

  

// Verificar si el usuario ya existe 

$query_verificar_usuario = "SELECT id FROM usuarios WHERE username = '$usr'"; 

$resultado_verificar_usuario = $conn->query($query_verificar_usuario); 

if ($resultado_verificar_usuario->num_rows > 0) { 

    $id_usuario = $resultado_verificar_usuario->fetch_assoc()['id']; 

    if ($id_usuario != null) { 

        echo "Error: El usuario ya existe."; 

    } else { 

        // Insertar el registro en la base de datos 

        $query = "INSERT INTO usuarios (username,name,email,password) VALUES ('$usr', '$name','$email','$contrasena_encriptada')"; 

        if ($conn->query($query) === TRUE) { 

            echo "Registro insertado correctamente."; 

            
        } else { 

            echo "Error al insertar el registro: ". $conn->error; 

        } 

    } 

} else { 

    // Insertar el registro en la base de datos 

    $query = "INSERT INTO usuarios (username,name,email,password) VALUES ('$usr', '$name','$email','$contrasena_encriptada')"; 

    if ($conn->query($query) === TRUE) { 

        echo "Registro insertado correctamente."; 

    } else { 

        echo "Error al insertar el registro: ". $conn->error; 

    } 

} 


  

// Cerrar la conexión 

$conn->close(); 

?> 

 