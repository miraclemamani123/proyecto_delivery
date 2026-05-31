<?php

namespace App\Http\Controllers;

use App\Models\Repartidor;
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

    // Ver pedidos asignados
    public function pedidos(Request $request)
    {
        $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedidos = $repartidor->pedidos()
            ->with(['cliente.usuario', 'negocio', 'detalles.producto'])
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

        // Registrar en historial
        $pedido->historial()->create([
            'estado_anterior'   => $estadoAnterior,
            'estado_nuevo'      => $request->estado,
            'cambiado_por_tipo' => 'repartidor',
            'cambiado_por_id'   => $request->user()->id,
        ]);

        // Si entregado, liberar repartidor
        if ($request->estado === 'entregado') {
            $repartidor->estado = 'disponible';
            $repartidor->save();
        }

        return response()->json([
            'message' => 'Estado del pedido actualizado',
            'estado'  => $pedido->estado,
        ]);
    }
}