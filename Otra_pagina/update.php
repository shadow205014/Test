<?php
// Connect to database
include("abrir_conexion.php"); 
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Define table name
$tableName = 'usuarios';

// Retrieve record ID from URL
$id = $_POST['id'];

// Fetch record data from database
$sql = "SELECT * FROM $tableName WHERE id = $id";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) == 1) {
    $row = mysqli_fetch_assoc($result);

    // Pre-fill form with existing data
    $name = $row['username'];
    $email = $row['email'];

} else {
    echo "Record not found.";
    exit;
}

// Handle form submission
if (isset($_POST['update'])) {
    $updatedName = $_POST['name'];
    $updatedEmail = $_POST['email'];

    // Update record in database
    $sql = "UPDATE $tableName SET name = '$updatedName', email = '$updatedEmail' WHERE id = $id";

    if (mysqli_query($conn, $sql)) {
        echo "Record updated successfully.";
        header('Location: crud.php'); // Redirect to read page
        exit;
    } else {
        echo "Error updating record: " . mysqli_error($conn);
    }
}

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" type="text/css" href="styles.css">
    <title>Update User</title>
</head>
<body>
    <div align="center"><h1>Update User</h1>
    </div>
    <form action="update.php? id= <?php echo $id; ?>" method="post">
        <input type='hidden' name='id' value="<?php echo $id; ?>    ">

        <label for="name">Name:</label>
        <input type="text" id="name" name="name" value="<?php echo $name; ?>">
        <br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="<?php echo $email; ?>">
        <br>
        <input type="submit" name="update" value="update">
    </form>
</body>
</html>