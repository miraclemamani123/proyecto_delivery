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
use App\Models\Notificacion;

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

    // 🟢 VERIFICAR DISPONIBILIDAD: Pone en ocupado temporal y dispara MOMENTO 1
    public function verificarDisponibilidad(Request $request)
    {
        $request->validate([
            'negocio_id' => 'required|exists:negocios,id',
        ]);

        $cliente = Cliente::where('usuario_id', $request->user()->id)->first();
        if (!$cliente || !$cliente->latitud || !$cliente->longitud) {
            return response()->json(['message' => 'Debes registrar tu ubicación primero'], 422);
        }

        $negocio = Negocio::where('id', $request->negocio_id)
            ->where('aprobado', true)
            ->where('estado', 'abierto')
            ->first();

        if (!$negocio) {
            return response()->json(['message' => 'El negocio no está disponible u operando'], 422);
        }

        $repartidor = Repartidor::where('estado', 'disponible')
            ->where('aprobado', true)
            ->first();

        if (!$repartidor) {
            return response()->json(['message' => 'No hay repartidores disponibles en este momento'], 422);
        }

        $repartidor->estado = 'ocupado';
        $repartidor->save();

        // 🔔 MOMENTO 1: Notificación para el REPARTIDOR
        // ✅ Fix: usar $repartidor->usuario_id directamente, sin getAttributes()
        Notificacion::create([
            'usuario_id' => $repartidor->usuario_id,
            'titulo'     => '🛵 MOTO_RESERVA',
            'mensaje'    => 'Has sido puesto en reserva para un pedido. Esperando confirmación de pago del cliente...',
            'tipo'       => 'sistema',
            'leido'      => false,
        ]);

        $tarifa = TarifaDelivery::where('activo', true)->firstOrFail();
        $distanciaKm = $this->calcularDistancia(
            $negocio->latitud, $negocio->longitud,
            $cliente->latitud, $cliente->longitud
        );
        $costoDelivery = round($distanciaKm * $tarifa->precio_por_km, 2);

        return response()->json([
            'disponible'     => true,
            'distancia_km'   => round($distanciaKm, 2),
            'costo_delivery' => $costoDelivery,
            'repartidor_id'  => $repartidor->id,
        ], 200);
    }

    // 🟢 STORE: Crea el registro oficial del pedido y dispara MOMENTO 2
    public function store(Request $request)
    {
        $request->validate([
            'negocio_id'              => 'required|exists:negocios,id',
            'productos'               => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad'    => 'required|integer|min:1',
            'metodo_pago'             => 'required|string',
            'repartidor_id'           => 'required|exists:repartidores,id',
        ]);

        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        if (!$cliente->latitud || !$cliente->longitud) {
            return response()->json(['message' => 'Ubicación no encontrada'], 422);
        }

        $negocio = Negocio::where('id', $request->negocio_id)
            ->where('aprobado', true)
            ->where('estado', 'abierto')
            ->firstOrFail();

        $repartidor = Repartidor::where('id', $request->repartidor_id)
            ->where('estado', 'ocupado')
            ->first();

        if (!$repartidor) {
            $repartidor = Repartidor::where('estado', 'disponible')
                ->where('aprobado', true)
                ->first();

            if (!$repartidor) {
                return response()->json(['message' => 'Nos quedamos sin repartidores en el último segundo'], 422);
            }
        }

        $tarifa = TarifaDelivery::where('activo', true)->firstOrFail();
        $distanciaKm = $this->calcularDistancia(
            $negocio->latitud, $negocio->longitud,
            $cliente->latitud, $cliente->longitud
        );
        $costoDelivery = round($distanciaKm * $tarifa->precio_por_km, 2);

        $subtotal = 0;
        $detalles = [];
        foreach ($request->productos as $item) {
            $producto = \App\Models\Producto::findOrFail($item['producto_id']);
            $subtotalItem = $producto->precio * $item['cantidad'];
            $subtotal += $subtotalItem;
            $detalles[] = [
                'producto_id'     => $producto->id,
                'cantidad'        => $item['cantidad'],
                'precio_unitario' => $producto->precio,
                'subtotal'        => $subtotalItem,
            ];
        }

        try {
            $pedido = Pedido::create([
                'cliente_id'     => $cliente->id,
                'negocio_id'     => $negocio->id,
                'repartidor_id'  => $repartidor->id,
                'tarifa_id'      => $tarifa->id,
                'estado'         => 'pendiente',
                'distancia_km'   => round($distanciaKm, 2),
                'costo_delivery' => $costoDelivery,
            ]);

            $pedido->detalles()->createMany($detalles);

            DistanciaPedido::create([
                'pedido_id'        => $pedido->id,
                'latitud_negocio'  => $negocio->latitud,
                'longitud_negocio' => $negocio->longitud,
                'latitud_cliente'  => $cliente->latitud,
                'longitud_cliente' => $cliente->longitud,
                'distancia_km'     => round($distanciaKm, 2),
            ]);

            Asignacion::create([
                'pedido_id'        => $pedido->id,
                'repartidor_id'    => $repartidor->id,
                'estado'           => 'asignado',
                'fecha_asignacion' => now(),
            ]);

            $repartidor->estado = 'ocupado';
            $repartidor->save();

            $pedido->historial()->create([
                'estado_anterior'   => null,
                'estado_nuevo'      => 'pendiente',
                'cambiado_por_tipo' => 'sistema',
                'cambiado_por_id'   => null,
            ]);

            // 🔔 MOMENTO 2: Notificación para el NEGOCIO
            // ✅ Fix: usar $negocio->usuario_id directamente, sin getAttributes()
            Notificacion::create([
                'usuario_id' => $negocio->usuario_id,
                'titulo'     => '🏪 NUEVO_PEDIDO_NEGOCIO',
                'mensaje'    => "Tienes una nueva orden (Pedido #{$pedido->id}) lista para preparación.",
                'tipo'       => 'pedido',
                'leido'      => false,
            ]);

            return response()->json([
                'message'        => 'Pedido procesado con éxito',
                'pedido_id'      => $pedido->id,
                'subtotal'       => $subtotal,
                'costo_delivery' => $costoDelivery,
                'total'          => $subtotal + $costoDelivery,
            ], 201);

        } catch (\Exception $e) {
            $repartidor->estado = 'disponible';
            $repartidor->save();
            return response()->json(['message' => 'Error interno de procesamiento', 'detalle' => $e->getMessage()], 500);
        }
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
    public function misPedidos(Request $request)
    {
        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedidos = Pedido::where('cliente_id', $cliente->id)
            ->with([
                'negocio',
                'detalles.producto',
                'repartidor.usuario',
                'distancia',
                'repartidor.ubicaciones' => function($q) {
                    $q->latest()->limit(1);
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pedidos);
    }

    // Negocio acepta o rechaza pedido
public function cambiarEstadoNegocio(Request $request, $id)
{
    $request->validate([
        'estado' => 'required|in:aceptado,rechazado,en_preparacion,listo',
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

    $pedido->historial()->create([
        'estado_anterior'   => $estadoAnterior,
        'estado_nuevo'      => $request->estado,
        'cambiado_por_tipo' => 'negocio',
        'cambiado_por_id'   => $request->user()->id,
    ]);

    // Notificación al REPARTIDOR cuando el negocio acepta
    if ($request->estado === 'aceptado') {
        $repartidor = Repartidor::find($pedido->repartidor_id);
        if ($repartidor) {
            Notificacion::create([
                'usuario_id' => $repartidor->usuario_id,
                'titulo'     => '🛵 ¡Viaje confirmado!',
                'mensaje'    => "El negocio aceptó el Pedido #{$pedido->id}. Dirígete al local a recoger los productos.",
                'tipo'       => 'pedido',
                'leido'      => false,
            ]);
        }
    }

    // Notificación al REPARTIDOR cuando el pedido está listo para recoger
    if ($request->estado === 'listo') {
        $repartidor = Repartidor::find($pedido->repartidor_id);
        if ($repartidor) {
            Notificacion::create([
                'usuario_id' => $repartidor->usuario_id,
                'titulo'     => '📦 ¡Pedido listo!',
                'mensaje'    => "El Pedido #{$pedido->id} ya está listo. Dirígete al local a recogerlo.",
                'tipo'       => 'pedido',
                'leido'      => false,
            ]);
        }
    }

    return response()->json([
        'message' => 'Estado del pedido actualizado',
        'estado'  => $pedido->estado,
    ]);
}

    // Listar pedidos asignados al negocio
    public function pedidosNegocio(Request $request)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $pedidos = Pedido::where('negocio_id', $negocio->id)
            ->with(['cliente.usuario', 'detalles.producto', 'repartidor.usuario'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pedidos);
    }

    // Cancelación o regreso seguro del cliente antes de confirmar el pago
    public function liberarReserva(Request $request)
    {
        $request->validate([
            'repartidor_id' => 'required|exists:repartidores,id'
        ]);

        $repartidor = Repartidor::find($request->repartidor_id);

        if ($repartidor && $repartidor->estado === 'ocupado') {
            $repartidor->estado = 'disponible';
            $repartidor->save();
        }

        return response()->json(['message' => 'Repartidor liberado exitosamente'], 200);
    }
}