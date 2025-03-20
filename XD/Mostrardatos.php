<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="styles.css">
  <link rel="stylesheet" type="text/css" href="Mostrardatos.css">
  <title>Datos</title>
</head>
<header>
  <h1>Mi pagina web</h1>
</header>

<nav>
  <ul class="menu" >
    <li><a href="Index.html">Inicio</a></li>
    <li><a href="usuarios.html">Usuarios</a></li>
    <li><a href="Mostrardatos.php">Mostrar Datos</a></li>
    <li><a href="productos.html">Productos</a></li>			
    <li><a href="#">Acerca de</a></li>
    <li><a href="#">Contacto</a></li>		</ul>
</nav>
	<body>
		<div class="datos" align="center">
			<?php
    		include 'datos.php';
   			?>
		</div>
	</body>
</html>		
