<?php
session_start();

if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CRUD Application</title>
    <link rel="stylesheet" href="estilo.css">
</head>


<body>

    <style>
      
      #registro {
        display: none;
      }
      #registro.mostrar {
        display: block;
      }

    </style>
    
    <h1>CRUD Application</h1>
    <h2>Lista de Usuarios</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo Electrónico</th>
            <th>Acciones</th>
        </tr>

        <?php
        // Connect to database
        
        include("abrir_conexion.php"); 

        // Check connection
        if (!$conn) {
            die("Connection failed: " . mysqli_connect_error());
        }

        // Define table name
        $tableName = 'usuarios';

        // Read (Display Records)
        $sql = "SELECT * FROM $tableName";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<tr>";
                echo "<td>". $row['Id']. "</td>";
                echo "<td>". $row['name']. "</td>";
                echo "<td>". $row['email']. "</td>";
                echo "<td>";
                echo "<form action='update.php' method='post'>";
                echo "<input type='hidden' name='id' value='". $row['Id']. "'>";
                echo "<button type='submit' class='edit-button'>Editar</button>";
                echo "</form>";
                echo "<form action='delete.php' method='post'>";
                echo "<input type='hidden' name='id' value='". $row['Id']. "'>";
                echo "<button type='submit' class='delete-button'>Eliminar</button>";
                echo "</form>";
                echo "</td>";
                echo "</tr>";
            }
        } else {
            echo "No records found.";
        }

        mysqli_close($conn);
        ?>

    </table>
    
    <a href="#" id="boton-registro"><button>Agregar</button></a>
    <a href="index.php" id="boton-regresar"><button>Volver</button></a>
    <div id="registro">
        <?php include 'registro.html';?>
    </div>

        <script>
      document.getElementById('boton-registro').addEventListener('click', function() {
        document.getElementById('registro').classList.add('mostrar');
      });
      document.getElementById('boton-login').addEventListener('click', function() {
        document.getElementById('login').classList.remove('mostrar');
      });


    $(document).ready(function() {
        $('.edit-button').click(function() {
            var id = $(this).data('id');
            window.location.href = 'update.php?id=' + id;
        });
        
        $('.delete-button').click(function() {
            var id = $(this).data('id');
            if (confirm("¿Estás seguro de eliminar este registro?")) {
                window.location.href = 'delete.php?id=' + id;
            }
        });
    });

    </script>
</body>
</html>

<?php
} else {
    header('Location: login.php');
    exit;
}
?>