<?php

namespace App\Http\Controllers;

use App\Models\Repartidor;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class RepartidorController extends Controller
{
    // Ver perfil del repartidor
    public function perfil(Request $request)
    {
        $repartidor = Repartidor::where('usuario_id', $request->user()->id)
            ->with('usuario')
            ->firstOrFail();

        return response()->json($repartidor);
    }

    // Cambiar estado disponible/inactivo
    public function cambiarEstado(Request $request)
    {
        $request->validate([
            'estado' => 'required|in:disponible,inactivo',
        ]);

        $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();

        if ($repartidor->estado === 'ocupado') {
            return response()->json([
                'message' => 'No puedes cambiar tu estado mientras tienes un pedido activo',
            ], 403);
        }

        $repartidor->estado = $request->estado;
        $repartidor->save();

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'estado'  => $repartidor->estado,
        ]);
    }

    // Ver pedidos asignados — incluye ubicación del repartidor, negocio y cliente con coordenadas
    public function pedidos(Request $request)
    {
        $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedidos = $repartidor->pedidos()
            ->with([
                'cliente.usuario',
                'negocio',
                'detalles.producto',
                // ✅ Última ubicación del repartidor para el mapa
                'repartidor.ubicaciones' => function($q) {
                    $q->latest()->limit(1);
                },
                // ✅ Coordenadas exactas del negocio y cliente guardadas al crear el pedido
                'distancia',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pedidos);
    }

    // Cambiar estado del pedido (en_camino / entregado)
public function cambiarEstadoPedido(Request $request, $pedidoId)
{
    $request->validate([
        'estado' => 'required|in:en_camino,entregado',
    ]);

    $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();
    $pedido = $repartidor->pedidos()->where('id', $pedidoId)->firstOrFail();

    $estadoAnterior = $pedido->estado;
    $pedido->estado = $request->estado;
    $pedido->save();

    $pedido->historial()->create([
        'estado_anterior'   => $estadoAnterior,
        'estado_nuevo'      => $request->estado,
        'cambiado_por_tipo' => 'repartidor',
        'cambiado_por_id'   => $request->user()->id,
    ]);

    $pedido->load('cliente');;

    // Notif al cliente cuando sale a entregar
    if ($request->estado === 'en_camino') {
        Notificacion::create([
            'usuario_id' => $pedido->cliente->usuario_id,
            'titulo'     => '🛵 Tu pedido está en camino',
            'mensaje'    => "Tu pedido #{$pedido->id} está en camino. Prepara S/{$pedido->costo_delivery} en efectivo.",
            'tipo'       => 'pedido',
            'leido'      => false,
        ]);
    }

    // Notif al cliente + liberar repartidor cuando entrega
    if ($request->estado === 'entregado') {
        $repartidor->estado = 'disponible';
        $repartidor->save();

        Notificacion::create([
            'usuario_id' => $pedido->cliente->usuario_id,
            'titulo'     => '🎉 Pedido entregado',
            'mensaje'    => "Tu pedido #{$pedido->id} fue entregado. ¡Buen provecho!",
            'tipo'       => 'pedido',
            'leido'      => false,
        ]);
    }

    return response()->json([
        'message' => 'Estado del pedido actualizado',
        'estado'  => $pedido->estado,
    ]);
}

public function notificarCliente(Request $request)
{
    $request->validate([
        'pedido_id' => 'required|exists:pedidos,id',
        'tipo'      => 'required|in:cerca,llegue',
    ]);

    $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();
    $pedido = $repartidor->pedidos()
        ->where('id', $request->pedido_id)
        ->with('cliente')
        ->firstOrFail();

    $notifs = [
        'cerca'  => [
            'titulo'  => '🛵 Tu repartidor está cerca',
            'mensaje' => 'Tu repartidor está a menos de 300 metros. ¡Prepárate para recibir tu pedido!',
        ],
        'llegue' => [
            'titulo'  => '📍 Tu repartidor llegó',
            'mensaje' => "Tu repartidor llegó a tu ubicación con el pedido #{$pedido->id}.",
        ],
    ];

    Notificacion::create([
        'usuario_id' => $pedido->cliente->usuario_id,
        'titulo'     => $notifs[$request->tipo]['titulo'],
        'mensaje'    => $notifs[$request->tipo]['mensaje'],
        'tipo'       => 'pedido',
        'leido'      => false,
    ]);

    return response()->json(['message' => 'Notificación enviada']);
}
}