<?php

namespace App\Http\Controllers;

use App\Models\Repartidor;
use App\Models\UbicacionRepartidor;
use Illuminate\Http\Request;

class UbicacionRepartidorController extends Controller
{
    // Actualizar ubicación del repartidor
    public function store(Request $request)
    {
        $request->validate([
            'latitud'  => 'required|numeric',
            'longitud' => 'required|numeric',
        ]);

        $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();

        // Actualizar ubicación actual
        $repartidor->latitud  = $request->latitud;
        $repartidor->longitud = $request->longitud;
        $repartidor->save();

        // Guardar en historial
        UbicacionRepartidor::create([
            'repartidor_id' => $repartidor->id,
            'latitud'       => $request->latitud,
            'longitud'      => $request->longitud,
        ]);

        return response()->json([
            'message'  => 'Ubicación actualizada correctamente',
            'latitud'  => $request->latitud,
            'longitud' => $request->longitud,
        ]);
    }

    // Ver historial de ubicaciones
    public function historial(Request $request)
    {
        $repartidor = Repartidor::where('usuario_id', $request->user()->id)->firstOrFail();

        $ubicaciones = UbicacionRepartidor::where('repartidor_id', $repartidor->id)
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return response()->json($ubicaciones);
    }
}