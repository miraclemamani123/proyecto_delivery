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
        $negocio->aprobado    = true;
        $negocio->aprobado_por = $request->user()->id;
        $negocio->save();

        return response()->json([
            'message' => 'Negocio aprobado correctamente',
            'negocio' => $negocio,
        ]);
    }

    // Desactivar negocio
    public function desactivarNegocio($id)
    {
        $negocio = Negocio::findOrFail($id);
        $negocio->aprobado = false;
        $negocio->save();

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
        $repartidor->aprobado    = true;
        $repartidor->aprobado_por = $request->user()->id;
        $repartidor->estado      = 'disponible';
        $repartidor->save();

        return response()->json([
            'message'     => 'Repartidor aprobado correctamente',
            'repartidor'  => $repartidor,
        ]);
    }

    // Desactivar repartidor
    public function desactivarRepartidor($id)
    {
        $repartidor = Repartidor::findOrFail($id);
        $repartidor->aprobado = false;
        $repartidor->estado   = 'inactivo';
        $repartidor->save();

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
}