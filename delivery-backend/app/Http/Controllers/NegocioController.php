<?php

namespace App\Http\Controllers;

use App\Models\Negocio;
use Illuminate\Http\Request;

class NegocioController extends Controller
{
    // Lista negocios aprobados y abiertos (para el cliente)
    public function index()
    {
        $negocios = Negocio::where('aprobado', true)
            ->where('estado', 'abierto')
            ->with('categoria')
            ->get();

        return response()->json($negocios);
    }

    // Ver un negocio específico con sus productos
    public function show($id)
    {
        $negocio = Negocio::where('id', $id)
            ->where('aprobado', true)
            ->with(['categoria', 'productos' => function($q) {
                $q->where('disponible', true);
            }])
            ->firstOrFail();

        return response()->json($negocio);
    }

    // Registrar negocio
    public function store(Request $request)
    {
        $request->validate([
            'nombre'              => 'required|string|max:150',
            'descripcion'         => 'nullable|string',
            'direccion'           => 'required|string',
            'latitud'             => 'required|numeric',
            'longitud'            => 'required|numeric',
            'categoria_negocio_id' => 'required|exists:categorias_negocio,id',
        ]);

        $negocio = Negocio::create([
            'usuario_id'           => $request->user()->id,
            'categoria_negocio_id' => $request->categoria_negocio_id,
            'nombre'               => $request->nombre,
            'descripcion'          => $request->descripcion,
            'direccion'            => $request->direccion,
            'latitud'              => $request->latitud,
            'longitud'             => $request->longitud,
            'estado'               => 'cerrado',
            'aprobado'             => false,
        ]);

        return response()->json([
            'message' => 'Negocio registrado, pendiente de aprobación',
            'negocio' => $negocio,
        ], 201);
    }

    // Actualizar datos del negocio
    public function update(Request $request, $id)
    {
        $negocio = Negocio::where('id', $id)
            ->where('usuario_id', $request->user()->id)
            ->firstOrFail();

        $negocio->update($request->only([
            'nombre', 'descripcion', 'direccion',
            'latitud', 'longitud', 'categoria_negocio_id'
        ]));

        return response()->json([
            'message' => 'Negocio actualizado correctamente',
            'negocio' => $negocio,
        ]);
    }

    // Abrir o cerrar el negocio
    public function toggleEstado(Request $request, $id)
    {
        $negocio = Negocio::where('id', $id)
            ->where('usuario_id', $request->user()->id)
            ->firstOrFail();

        $negocio->estado = $negocio->estado === 'abierto' ? 'cerrado' : 'abierto';
        $negocio->save();

        return response()->json([
            'message' => 'Estado actualizado',
            'estado'  => $negocio->estado,
        ]);
    }
}