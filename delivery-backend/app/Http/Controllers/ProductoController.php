<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Negocio;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    // Listar productos del negocio
    public function index(Request $request)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $productos = Producto::where('negocio_id', $negocio->id)
            ->with('categoria')
            ->get();

        return response()->json($productos);
    }

    // Crear producto
    public function store(Request $request)
    {
        $request->validate([
            'nombre'               => 'required|string|max:150',
            'descripcion'          => 'nullable|string',
            'precio'               => 'required|numeric|min:0',
            'categoria_producto_id' => 'required|exists:categorias_producto,id',
        ]);

        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $producto = Producto::create([
            'negocio_id'           => $negocio->id,
            'categoria_producto_id' => $request->categoria_producto_id,
            'nombre'               => $request->nombre,
            'descripcion'          => $request->descripcion,
            'precio'               => $request->precio,
            'disponible'           => true,
        ]);

        return response()->json([
            'message'  => 'Producto creado correctamente',
            'producto' => $producto,
        ], 201);
    }

    // Actualizar producto
    public function update(Request $request, $id)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $producto = Producto::where('id', $id)
            ->where('negocio_id', $negocio->id)
            ->firstOrFail();

        $producto->update($request->only([
            'nombre', 'descripcion', 'precio', 'categoria_producto_id'
        ]));

        return response()->json([
            'message'  => 'Producto actualizado correctamente',
            'producto' => $producto,
        ]);
    }

    // Activar o desactivar producto
    public function toggleDisponible(Request $request, $id)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $producto = Producto::where('id', $id)
            ->where('negocio_id', $negocio->id)
            ->firstOrFail();

        $producto->disponible = !$producto->disponible;
        $producto->save();

        return response()->json([
            'message'    => 'Disponibilidad actualizada',
            'disponible' => $producto->disponible,
        ]);
    }

    // Eliminar producto
    public function destroy(Request $request, $id)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

        $producto = Producto::where('id', $id)
            ->where('negocio_id', $negocio->id)
            ->firstOrFail();

        $producto->delete();

        return response()->json([
            'message' => 'Producto eliminado correctamente',
        ]);
    }
}