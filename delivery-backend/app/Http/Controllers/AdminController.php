<?php

namespace App\Http\Controllers;

use App\Models\Negocio;
use App\Models\Repartidor;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Listar todos los negocios
    public function negocios()
    {
        $negocios = Negocio::with('usuario', 'categoria')->get();
        return response()->json($negocios);
    }

    // Aprobar negocio
    public function aprobarNegocio(Request $request, $id)
    {
        $negocio = Negocio::findOrFail($id);
        $negocio->aprobado     = true;
        $negocio->aprobado_por = $request->user()->id;
        $negocio->save();

        activity()
            ->causedBy($request->user())
            ->performedOn($negocio)
            ->log("El administrador {$request->user()->name} aprobó el negocio {$negocio->nombre}");

        return response()->json([
            'message' => 'Negocio aprobado correctamente',
            'negocio' => $negocio,
        ]);
    }

    // Desactivar negocio
    public function desactivarNegocio(Request $request, $id)
    {
        $negocio = Negocio::findOrFail($id);
        $negocio->aprobado = false;
        $negocio->save();

        activity()
            ->causedBy($request->user())
            ->performedOn($negocio)
            ->log("El administrador {$request->user()->name} desactivó el negocio {$negocio->nombre}");

        return response()->json([
            'message' => 'Negocio desactivado correctamente',
        ]);
    }

    // Listar todos los repartidores
    public function repartidores()
    {
        $repartidores = Repartidor::with('usuario')->get();
        return response()->json($repartidores);
    }

    // Aprobar repartidor
    public function aprobarRepartidor(Request $request, $id)
    {
        $repartidor = Repartidor::findOrFail($id);
        $repartidor->aprobado     = true;
        $repartidor->aprobado_por = $request->user()->id;
        $repartidor->estado       = 'disponible';
        $repartidor->save();

        activity()
            ->causedBy($request->user())
            ->performedOn($repartidor)
            ->log("El administrador {$request->user()->name} aprobó al repartidor {$repartidor->usuario->name}");

        return response()->json([
            'message'    => 'Repartidor aprobado correctamente',
            'repartidor' => $repartidor,
        ]);
    }

    // Desactivar repartidor
    public function desactivarRepartidor(Request $request, $id)
    {
        $repartidor = Repartidor::findOrFail($id);
        $repartidor->aprobado = false;
        $repartidor->estado   = 'inactivo';
        $repartidor->save();

        activity()
            ->causedBy($request->user())
            ->performedOn($repartidor)
            ->log("El administrador {$request->user()->name} desactivó al repartidor {$repartidor->usuario->name}");

        return response()->json([
            'message' => 'Repartidor desactivado correctamente',
        ]);
    }

    // Monitorear todos los pedidos
    public function pedidos()
    {
        $pedidos = Pedido::with([
            'cliente.usuario',
            'negocio',
            'repartidor.usuario',
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($pedidos);
    }

    // Ver tarifa actual
    public function tarifa()
    {
        $tarifa = \App\Models\TarifaDelivery::where('activo', true)->first();
        return response()->json($tarifa);
    }

    // Actualizar tarifa
    public function actualizarTarifa(Request $request)
    {
        $request->validate([
            'precio_por_km' => 'required|numeric|min:0.1',
        ]);

        $tarifa = \App\Models\TarifaDelivery::where('activo', true)->first();

        if (!$tarifa) {
            $tarifa = \App\Models\TarifaDelivery::create([
                'precio_por_km' => $request->precio_por_km,
                'activo'        => true,
            ]);
        } else {
            $tarifa->precio_por_km = $request->precio_por_km;
            $tarifa->save();
        }

        activity()
            ->causedBy($request->user())
            ->performedOn($tarifa)
            ->log("El administrador {$request->user()->name} actualizó la tarifa de delivery a S/{$request->precio_por_km}/km");

        return response()->json([
            'message' => 'Tarifa actualizada correctamente',
            'tarifa'  => $tarifa,
        ]);
    }

    // Ver auditoría
    public function auditoria()
    {
        $logs = \Spatie\Activitylog\Models\Activity::with('causer')
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get()
            ->map(fn($log) => [
                'id'          => $log->id,
                'descripcion' => $log->description,
                'usuario'     => $log->causer?->name ?? 'Sistema',
                'fecha'       => $log->created_at->format('d/m/Y H:i'),
            ]);

        return response()->json($logs);
    }
}