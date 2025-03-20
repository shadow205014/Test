<?php

Include("abrir_conexion.php");

// Check connection
if ($conn->connect_error) {
	die("Connection failed: ". $conn->connect_error);
}

// Selecciona los datos de la tabla
$sql = "SELECT * FROM usuarios";
$result = $conn->query($sql);
	
// Imprime los datos en el HTML
if ($result->num_rows > 0) {
	echo "<table><tr><th>Username</th><th>Nombre</th><th>Email</th><th>Password</th></tr>";
	// Output data of each row
	while($row = $result->fetch_assoc()) {
		echo "<tr><td>".$row["username"]."</td><td>".$row["name"]."</td><td>".$row["email"]."</td><td>".$row["password"]."</td></tr>";
	}
	echo "</table>";
} else {
	echo "0 results";
}

$conn->close();
?>