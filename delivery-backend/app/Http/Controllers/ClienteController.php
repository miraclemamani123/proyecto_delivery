<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    // Ver perfil del cliente
    public function perfil(Request $request)
    {
        $cliente = Cliente::where('usuario_id', $request->user()->id)
            ->with('usuario')
            ->firstOrFail();

        return response()->json($cliente);
    }

    // Actualizar ubicación del cliente
    public function actualizarUbicacion(Request $request)
    {
        $request->validate([
            'latitud'  => 'required|numeric',
            'longitud' => 'required|numeric',
        ]);

        $cliente = Cliente::where('usuario_id', $request->user()->id)->firstOrFail();

        $cliente->latitud  = $request->latitud;
        $cliente->longitud = $request->longitud;
        $cliente->save();

        return response()->json([
            'message' => 'Ubicación actualizada correctamente',
            'latitud'  => $cliente->latitud,
            'longitud' => $cliente->longitud,
        ]);
    }
}