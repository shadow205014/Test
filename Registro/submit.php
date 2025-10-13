<?php
/**
 * ARCHIVO PHP OPCIONAL - submit.php
 * Este archivo puede usarse como intermediario entre el formulario y Google Apps Script
 * Solo es necesario si quieres procesar datos en el servidor antes de enviarlos a Google
 */

// Habilitar CORS si es necesario
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Verificar que sea una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    // Obtener los datos del formulario
    $inputData = file_get_contents('php://input');
    $data = json_decode($inputData, true);
    
    // Validar que se recibieron datos
    if (!$data) {
        throw new Exception('No se recibieron datos válidos');
    }
    
    // Validaciones básicas del lado del servidor
    $requiredFields = ['nombre', 'email', 'discord', 'evento', 'nombreEvento', 'fecha', 'hora', 'participantes', 'descripcion'];
    
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("El campo '{$field}' es requerido");
        }
    }
    
    // Validar email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El correo electrónico no es válido');
    }
    
    // Validar fecha
    $fechaEvento = strtotime($data['fecha']);
    $hoy = strtotime(date('Y-m-d'));
    
    if ($fechaEvento < $hoy) {
        throw new Exception('La fecha del evento debe ser posterior a hoy');
    }
    
    // Sanitizar datos
    $cleanData = [
        'nombre' => htmlspecialchars(strip_tags($data['nombre']), ENT_QUOTES, 'UTF-8'),
        'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
        'discord' => htmlspecialchars(strip_tags($data['discord']), ENT_QUOTES, 'UTF-8'),
        'evento' => htmlspecialchars(strip_tags($data['evento']), ENT_QUOTES, 'UTF-8'),
        'nombreEvento' => htmlspecialchars(strip_tags($data['nombreEvento']), ENT_QUOTES, 'UTF-8'),
        'fecha' => htmlspecialchars(strip_tags($data['fecha']), ENT_QUOTES, 'UTF-8'),
        'hora' => htmlspecialchars(strip_tags($data['hora']), ENT_QUOTES, 'UTF-8'),
        'participantes' => intval($data['participantes']),
        'plataforma' => isset($data['plataforma']) ? htmlspecialchars(strip_tags($data['plataforma']), ENT_QUOTES, 'UTF-8') : 'No aplica',
        'canalUrl' => isset($data['canalUrl']) ? filter_var($data['canalUrl'], FILTER_SANITIZE_URL) : 'No proporcionado',
        'descripcion' => htmlspecialchars(strip_tags($data['descripcion']), ENT_QUOTES, 'UTF-8'),
        'requisitos' => isset($data['requisitos']) ? htmlspecialchars(strip_tags($data['requisitos']), ENT_QUOTES, 'UTF-8') : 'Ninguno',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // URL de tu Google Apps Script Web App
    $googleScriptUrl = 'TU_WEB_APP_URL_AQUI';
    
    // Configurar la solicitud a Google Apps Script
    $ch = curl_init($googleScriptUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cleanData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen(json_encode($cleanData))
    ]);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    // Ejecutar la solicitud
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    // Verificar errores de cURL
    if ($curlError) {
        throw new Exception('Error al conectar con Google Apps Script: ' . $curlError);
    }
    
    // Verificar código de respuesta HTTP
    if ($httpCode !== 200 && $httpCode !== 302) {
        throw new Exception('Error del servidor de Google: Código ' . $httpCode);
    }
    
    // Guardar registro local (opcional)
    saveLocalRecord($cleanData);
    
    // Responder con éxito
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Registro enviado exitosamente'
    ]);
    
} catch (Exception $e) {
    // Registrar error
    error_log('Error en submit.php: ' . $e->getMessage());
    
    // Responder con error
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

/**
 * Función para guardar registro localmente (opcional)
 * Útil como respaldo en caso de que falle Google Sheets
 */
function saveLocalRecord($data) {
    try {
        $logFile = __DIR__ . '/registros_log.json';
        $registros = [];
        
        // Cargar registros existentes
        if (file_exists($logFile)) {
            $contenido = file_get_contents($logFile);
            $registros = json_decode($contenido, true) ?: [];
        }
        
        // Agregar nuevo registro
        $registros[] = $data;
        
        // Guardar
        file_put_contents($logFile, json_encode($registros, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
    } catch (Exception $e) {
        error_log('Error al guardar registro local: ' . $e->getMessage());
        // No lanzamos excepción para que no afecte el flujo principal
    }
}

/**
 * Función para enviar email de notificación (opcional)
 * Requiere configuración de PHPMailer o similar
 */
function sendNotificationEmail($data) {
    // Implementar según tu configuración de correo
    // Ejemplo básico con mail() de PHP:
    
    $to = 'tu-email@ejemplo.com';
    $subject = 'Nuevo Registro de Evento: ' . $data['nombreEvento'];
    
    $message = "
    Se ha recibido un nuevo registro de evento en NovaVerse.
    
    INFORMACIÓN DEL ORGANIZADOR:
    Nombre: {$data['nombre']}
    Email: {$data['email']}
    Discord: {$data['discord']}
    
    INFORMACIÓN DEL EVENTO:
    Tipo: {$data['evento']}
    Nombre: {$data['nombreEvento']}
    Fecha: {$data['fecha']}
    Hora: {$data['hora']}
    Participantes: {$data['participantes']}
    
    DESCRIPCIÓN:
    {$data['descripcion']}
    ";
    
    $headers = "From: noreply@novaverse.top\r\n";
    $headers .= "Reply-To: {$data['email']}\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);
}
?>