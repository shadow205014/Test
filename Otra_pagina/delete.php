<?php
// Conectar a la base de datos
include("abrir_conexion.php");

// Check connection
if (!$conn) {
    die("Connection failed: ". mysqli_connect_error());
}

// Retrieve record ID from URL
$id = $_POST['id'];

// Delete record from database
$sql = "DELETE FROM usuarios WHERE id = $id";

if (mysqli_query($conn, $sql)) {
    echo "Record deleted successfully.";
    header('Location: crud.php'); // Redirect to read page
    exit;
} else {
    echo "Error deleting record: ". mysqli_error($conn);
}

// Cerrar la conexión a la base de datos
mysqli_close($conn);
?>