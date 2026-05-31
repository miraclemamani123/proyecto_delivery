<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProducto;
use App\Models\Negocio;
use Illuminate\Http\Request;

class CategoriaProductoController extends Controller
{
    // Listar categorías del negocio
    public function index(Request $request)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $categorias = CategoriaProducto::where('negocio_id', $negocio->id)->get();

        return response()->json($categorias);
    }

    // Crear categoría
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
        ]);

        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $categoria = CategoriaProducto::create([
            'negocio_id' => $negocio->id,
            'nombre'     => $request->nombre,
            'activo'     => true,
        ]);

        return response()->json([
            'message'   => 'Categoría creada correctamente',
            'categoria' => $categoria,
        ], 201);
    }

    // Actualizar categoría
    public function update(Request $request, $id)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $categoria = CategoriaProducto::where('id', $id)
            ->where('negocio_id', $negocio->id)
            ->firstOrFail();

        $categoria->update($request->only(['nombre', 'activo']));

        return response()->json([
            'message'   => 'Categoría actualizada correctamente',
            'categoria' => $categoria,
        ]);
    }

    // Eliminar categoría
    public function destroy(Request $request, $id)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $categoria = CategoriaProducto::where('id', $id)
            ->where('negocio_id', $negocio->id)
            ->firstOrFail();

        $categoria->delete();

        return response()->json([
            'message' => 'Categoría eliminada correctamente',
        ]);
    }
}