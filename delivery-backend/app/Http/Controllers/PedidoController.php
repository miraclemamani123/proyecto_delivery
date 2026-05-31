<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Negocio;
use App\Models\Repartidor;
use App\Models\TarifaDelivery;
use App\Models\DistanciaPedido;
use App\Models\Asignacion;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    // Calcular distancia con fórmula Haversine
    private function calcularDistancia($lat1, $lon1, $lat2, $lon2)
    {
        $radioTierra = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $radioTierra * $c;
    }

    // Crear pedido
    public function store(Request $request)
    {
        $request->validate([
            'negocio_id' => 'required|exists:negocios,id',
            'productos'  => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad'    => 'required|integer|min:1',
        ]);

        // Verificar que el cliente tiene ubicación
        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        if (!$cliente->latitud || !$cliente->longitud) {
            return response()->json([
                'message' => 'Debes registrar tu ubicación antes de hacer un pedido',
            ], 422);
        }

        // Verificar negocio aprobado y abierto
        $negocio = Negocio::where('id', $request->negocio_id)
            ->where('aprobado', true)
            ->where('estado', 'abierto')
            ->firstOrFail();

        // Verificar repartidor disponible
        $repartidor = Repartidor::where('estado', 'disponible')
            ->where('aprobado', true)
            ->first();

        if (!$repartidor) {
            return response()->json([
                'message' => 'No hay repartidores disponibles en este momento',
            ], 422);
        }

        // Obtener tarifa activa
        $tarifa = TarifaDelivery::where('activo', true)->firstOrFail();

        // Calcular distancia y costo delivery
        $distanciaKm = $this->calcularDistancia(
            $negocio->latitud, $negocio->longitud,
            $cliente->latitud, $cliente->longitud
        );
        $costoDelivery = round($distanciaKm * $tarifa->precio_por_km, 2);

        // Calcular subtotal
        $subtotal = 0;
        $detalles = [];
        foreach ($request->productos as $item) {
            $producto = \App\Models\Producto::findOrFail($item['producto_id']);
            $subtotalItem = $producto->precio * $item['cantidad'];
            $subtotal += $subtotalItem;
            $detalles[] = [
                'producto_id'    => $producto->id,
                'cantidad'       => $item['cantidad'],
                'precio_unitario' => $producto->precio,
                'subtotal'       => $subtotalItem,
            ];
        }

        // Crear pedido
        $pedido = Pedido::create([
            'cliente_id'     => $cliente->id,
            'negocio_id'     => $negocio->id,
            'repartidor_id'  => $repartidor->id,
            'tarifa_id'      => $tarifa->id,
            'estado'         => 'pendiente',
            'distancia_km'   => round($distanciaKm, 2),
            'costo_delivery' => $costoDelivery,
        ]);

        // Crear detalles
        $pedido->detalles()->createMany($detalles);

        // Registrar distancia
        DistanciaPedido::create([
            'pedido_id'       => $pedido->id,
            'latitud_negocio' => $negocio->latitud,
            'longitud_negocio' => $negocio->longitud,
            'latitud_cliente' => $cliente->latitud,
            'longitud_cliente' => $cliente->longitud,
            'distancia_km'    => round($distanciaKm, 2),
        ]);

        // Asignar repartidor
        Asignacion::create([
            'pedido_id'       => $pedido->id,
            'repartidor_id'   => $repartidor->id,
            'estado'          => 'asignado',
            'fecha_asignacion' => now(),
        ]);

        // Cambiar estado del repartidor a ocupado
        $repartidor->estado = 'ocupado';
        $repartidor->save();

        // Registrar historial
        $pedido->historial()->create([
            'estado_anterior'   => null,
            'estado_nuevo'      => 'pendiente',
            'cambiado_por_tipo' => 'sistema',
            'cambiado_por_id'   => null,
        ]);

        return response()->json([
            'message'        => 'Pedido creado correctamente',
            'pedido_id'      => $pedido->id,
            'subtotal'       => $subtotal,
            'costo_delivery' => $costoDelivery,
            'total'          => $subtotal + $costoDelivery,
            'distancia_km'   => round($distanciaKm, 2),
        ], 201);
    }

    // Ver estado del pedido
    public function show(Request $request, $id)
    {
        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedido = Pedido::where('id', $id)
            ->where('cliente_id', $cliente->id)
            ->with(['negocio', 'repartidor.usuario', 'detalles.producto', 'historial'])
            ->firstOrFail();

        return response()->json($pedido);
    }

    // Listar pedidos del cliente
    public function misПедидос(Request $request)
    {
        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedidos = Pedido::where('cliente_id', $cliente->id)
            ->with(['negocio', 'detalles.producto'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pedidos);
    }

    // Negocio acepta o rechaza pedido
    public function cambiarEstadoNegocio(Request $request, $id)
    {
        $request->validate([
            'estado' => 'required|in:aceptado,rechazado,en_preparacion',
        ]);

        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedido = Pedido::where('id', $id)
            ->where('negocio_id', $negocio->id)
            ->firstOrFail();

        $estadoAnterior = $pedido->estado;
        $pedido->estado = $request->estado;
        $pedido->save();

        // Si rechazado, liberar repartidor
        if ($request->estado === 'rechazado') {
            $repartidor = Repartidor::find($pedido->repartidor_id);
            if ($repartidor) {
                $repartidor->estado = 'disponible';
                $repartidor->save();
            }
        }

        // Registrar historial
        $pedido->historial()->create([
            'estado_anterior'   => $estadoAnterior,
            'estado_nuevo'      => $request->estado,
            'cambiado_por_tipo' => 'negocio',
            'cambiado_por_id'   => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Estado del pedido actualizado',
            'estado'  => $pedido->estado,
        ]);
    }
}
