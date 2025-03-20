<?php

Include("abrir_conexion.php");
// Check connection
if ($conn->connect_error) {
	die("Connection failed: ". $conn->connect_error);
}

// Insert data into database
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$username = $_POST['username'];
	$email = $_POST['email'];
	$password = $_POST['password'];
	$confirm_password = $_POST['confirm-password'];

	$sql = "INSERT INTO usuarios (username, email, password) VALUES (?,?,?)";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param("sss", $username, $email, $password);

	if ($stmt->execute()) {
		echo "New record created successfully";
	} else {
		echo "Error: ". $stmt->error;
	}

	$stmt->close();
}

$conn->close();
?>