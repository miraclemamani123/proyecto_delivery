<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Pedido;
use App\Models\Cliente;
use Illuminate\Http\Request;

class PagoController extends Controller
{
    // Registrar pago del pedido
    public function store(Request $request, $pedidoId)
    {
        $request->validate([
            'monto'  => 'required|numeric|min:0',
            'metodo' => 'required|in:yape,plin,tunki',
        ]);

        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedido = Pedido::where('id', $pedidoId)
            ->where('cliente_id', $cliente->id)
            ->firstOrFail();

        // Verificar que no tenga pago ya registrado
        if ($pedido->pago) {
            return response()->json([
                'message' => 'Este pedido ya tiene un pago registrado',
            ], 422);
        }

        $pago = Pago::create([
            'pedido_id' => $pedido->id,
            'monto'     => $request->monto,
            'metodo'    => $request->metodo,
            'estado'    => 'pendiente',
        ]);

        return response()->json([
            'message' => 'Pago registrado correctamente',
            'pago'    => $pago,
        ], 201);
    }

    // Ver pago de un pedido
    public function show(Request $request, $pedidoId)
    {
        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedido = Pedido::where('id', $pedidoId)
            ->where('cliente_id', $cliente->id)
            ->firstOrFail();

        return response()->json($pedido->pago);
    }

    // Negocio confirma el pago
    public function confirmar(Request $request, $pedidoId)
    {
        $pago = Pago::where('pedido_id', $pedidoId)->firstOrFail();

        $pago->estado = 'completado';
        $pago->save();

        return response()->json([
            'message' => 'Pago confirmado correctamente',
            'pago'    => $pago,
        ]);
    }
}