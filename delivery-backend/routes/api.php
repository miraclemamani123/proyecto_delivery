<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NegocioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaProductoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\RepartidorController;
use App\Http\Controllers\UbicacionRepartidorController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NotificacionController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Negocios públicos (sin token)
Route::get('/negocios',      [NegocioController::class, 'index']);
Route::get('/negocios/{id}', [NegocioController::class, 'show']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Cliente
    Route::get('/cliente/perfil',             [ClienteController::class, 'perfil']);
    Route::put('/cliente/ubicacion',          [ClienteController::class, 'actualizarUbicacion']);
    Route::post('/cliente/pedidos/verificar-disponibilidad', [PedidoController::class, 'verificarDisponibilidad']);
    Route::post('/cliente/pedidos/liberar-reserva',          [PedidoController::class, 'liberarReserva']); // 👈 antes de {id}
    Route::get('/cliente/pedidos',            [PedidoController::class, 'misPedidos']);
    Route::post('/cliente/pedidos',           [PedidoController::class, 'store']);
    Route::get('/cliente/pedidos/{id}',       [PedidoController::class, 'show']);
    Route::post('/cliente/pedidos/{id}/pago', [PagoController::class, 'store']);
    Route::get('/cliente/pedidos/{id}/pago',  [PagoController::class, 'show']);


    // Negocio
    Route::post('/negocio',                           [NegocioController::class, 'store']);
    Route::get('/negocio/perfil',                     [NegocioController::class, 'perfil']);
    Route::put('/negocio/{id}',                       [NegocioController::class, 'update']);
    Route::patch('/negocio/{id}/estado',              [NegocioController::class, 'toggleEstado']);
    Route::get('/negocio/categorias',                 [CategoriaProductoController::class, 'index']);
    Route::post('/negocio/categorias',                [CategoriaProductoController::class, 'store']);
    Route::put('/negocio/categorias/{id}',            [CategoriaProductoController::class, 'update']);
    Route::delete('/negocio/categorias/{id}',         [CategoriaProductoController::class, 'destroy']);
    Route::get('/negocio/productos',                  [ProductoController::class, 'index']);
    Route::post('/negocio/productos',                 [ProductoController::class, 'store']);
    Route::post('/negocio/productos/{id}',            [ProductoController::class, 'update']);
    Route::patch('/negocio/productos/{id}/disponible',[ProductoController::class, 'toggleDisponible']);
    Route::get('/negocio/pedidos',                    [PedidoController::class, 'pedidosNegocio']);
    Route::patch('/negocio/pedidos/{id}/estado',      [PedidoController::class, 'cambiarEstadoNegocio']);
    Route::patch('/negocio/pedidos/{id}/pago',        [PagoController::class, 'confirmar']);
    Route::post('/negocio/imagen',                    [NegocioController::class, 'subirImagen']);
    Route::post('/negocio/qr',                        [NegocioController::class, 'subirQR']);
    Route::delete('/negocio/qr',                      [NegocioController::class, 'eliminarQR']);

    // Repartidor
    Route::get('/repartidor/perfil',                  [RepartidorController::class, 'perfil']);
    Route::patch('/repartidor/estado',                [RepartidorController::class, 'cambiarEstado']);
    Route::get('/repartidor/pedidos',                 [RepartidorController::class, 'pedidos']);
    Route::patch('/repartidor/pedidos/{id}/estado',   [RepartidorController::class, 'cambiarEstadoPedido']);
    Route::post('/repartidor/ubicacion',              [UbicacionRepartidorController::class, 'store']);
    Route::post('/repartidor/notificar-cliente', [RepartidorController::class, 'notificarCliente']);
    Route::get('/repartidor/ubicacion/historial',     [UbicacionRepartidorController::class, 'historial']);

    // Notificaciones
    Route::get('/notificaciones',                     [NotificacionController::class, 'index']);
    Route::patch('/notificaciones/{id}/leer',         [NotificacionController::class, 'marcarLeida']);
    Route::patch('/notificaciones/leer-todas',        [NotificacionController::class, 'marcarTodasLeidas']);

    // Admin
    Route::prefix('admin')->group(function () {
        Route::get('/negocios',                       [AdminController::class, 'negocios']);
        Route::patch('/negocios/{id}/aprobar',        [AdminController::class, 'aprobarNegocio']);
        Route::patch('/negocios/{id}/desactivar',     [AdminController::class, 'desactivarNegocio']);
        Route::get('/repartidores',                   [AdminController::class, 'repartidores']);
        Route::patch('/repartidores/{id}/aprobar',    [AdminController::class, 'aprobarRepartidor']);
        Route::patch('/repartidores/{id}/desactivar', [AdminController::class, 'desactivarRepartidor']);
        Route::get('/pedidos',                        [AdminController::class, 'pedidos']);
    });
});

