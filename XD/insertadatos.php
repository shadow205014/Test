<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="styles.css">
	<title>Formulario</title>
</head>
<body>
	<header>
        <h1>Mi pagina web</h1>
	</header>
	    <nav>
	        <ul class="menu">
	            <li><a href="Index.html">Inicio</a></li>
	            <li><a href="usuarios.html">Usuarios</a></li>
	            <li><a href="Mostrardatos.php">Mostrar Datos</a></li>
	            <li><a href="productos.html">Productos</a></li>
	            <li><a href="#">Acerca de</a></li>
	            <li><a href="#">Contacto</a></li>
	        </ul>
	    </nav>
	    <br>
	<form action="insert.php" method="post">
	<label for="name">Name:</label><br>
	<input type="text" id="name" name="name"><br>
	<label for="email">Email:</label><br>
	<input type="email" id="email" name="email"><br>
	<input type="submit" value="Submit">
</form>
</body>
</html>