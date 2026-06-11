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

    // Convertir paths a URLs completas
    $negocios->transform(function ($negocio) {
        $negocio->imagen   = $negocio->imagen   ? asset('storage/' . $negocio->imagen)   : null;
        $negocio->qr_yape  = $negocio->qr_yape  ? asset('storage/' . $negocio->qr_yape)  : null;
        $negocio->qr_plin  = $negocio->qr_plin  ? asset('storage/' . $negocio->qr_plin)  : null;
        $negocio->qr_tunki = $negocio->qr_tunki ? asset('storage/' . $negocio->qr_tunki) : null;
        return $negocio;
    });

    return response()->json($negocios);
}

public function show($id)
{
    $negocio = Negocio::where('id', $id)
        ->where('aprobado', true)
        ->with(['categoria', 'productos' => function($q) {
            $q->where('disponible', true);
        }])
        ->firstOrFail();

    $negocio->imagen   = $negocio->imagen   ? asset('storage/' . $negocio->imagen)   : null;
    $negocio->qr_yape  = $negocio->qr_yape  ? asset('storage/' . $negocio->qr_yape)  : null;
    $negocio->qr_plin  = $negocio->qr_plin  ? asset('storage/' . $negocio->qr_plin)  : null;
    $negocio->qr_tunki = $negocio->qr_tunki ? asset('storage/' . $negocio->qr_tunki) : null;

    return response()->json($negocio);
}
    // Perfil del negocio autenticado (para el dashboard del comercio)
    public function perfil(Request $request)
    {
        $negocio = Negocio::where('usuario_id', $request->user()->id)
            ->with('categoria')
            ->firstOrFail();

        // Convertir paths a URLs completas
        $negocio->imagen   = $negocio->imagen   ? asset('storage/' . $negocio->imagen)   : null;
        $negocio->qr_yape  = $negocio->qr_yape  ? asset('storage/' . $negocio->qr_yape)  : null;
        $negocio->qr_plin  = $negocio->qr_plin  ? asset('storage/' . $negocio->qr_plin)  : null;
        $negocio->qr_tunki = $negocio->qr_tunki ? asset('storage/' . $negocio->qr_tunki) : null;

        return response()->json($negocio);
    }

    // Registrar negocio
    public function store(Request $request)
    {
        $request->validate([
            'nombre'               => 'required|string|max:150',
            'descripcion'          => 'nullable|string',
            'direccion'            => 'required|string',
            'telefono'             => 'nullable|string|max:20',
            'latitud'              => 'required|numeric',
            'longitud'             => 'required|numeric',
            'categoria_negocio_id' => 'required|exists:categorias_negocio,id',
        ]);

        $negocio = Negocio::create([
            'usuario_id'           => $request->user()->id,
            'categoria_negocio_id' => $request->categoria_negocio_id,
            'nombre'               => $request->nombre,
            'descripcion'          => $request->descripcion,
            'direccion'            => $request->direccion,
            'telefono'             => $request->telefono,
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
        'latitud', 'longitud', 'categoria_negocio_id', 'telefono'
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

    // Subir imagen del negocio
public function subirImagen(Request $request)
{
    $request->validate([
        'imagen' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

    // Eliminar imagen anterior si existe
    if ($negocio->imagen) {
        \Storage::disk('public')->delete($negocio->imagen);
    }

    $path = $request->file('imagen')->store('negocios', 'public');
    $negocio->imagen = $path;
    $negocio->save();

    return response()->json([
        'message' => 'Imagen actualizada correctamente',
        'imagen'  => asset('storage/' . $path),
    ]);
}

// Subir QRs de pago del negocio
public function subirQR(Request $request)
{
    $request->validate([
        'tipo'  => 'required|in:yape,plin,tunki',
        'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

    $campo = 'qr_' . $request->tipo;

    // Eliminar QR anterior si existe
    if ($negocio->$campo) {
        \Storage::disk('public')->delete($negocio->$campo);
    }

    $path = $request->file('image')->store('qrs', 'public');
    $negocio->$campo = $path;
    $negocio->save();

    return response()->json([
        'message' => 'QR actualizado correctamente',
        'url'     => asset('storage/' . $path),
    ]);
}

// Eliminar QR de pago
public function eliminarQR(Request $request)
{
    $request->validate([
        'tipo' => 'required|in:yape,plin,tunki',
    ]);

    $negocio = Negocio::where('usuario_id', $request->user()->id)->firstOrFail();

    $campo = 'qr_' . $request->tipo;

    if ($negocio->$campo) {
        \Storage::disk('public')->delete($negocio->$campo);
        $negocio->$campo = null;
        $negocio->save();
    }

    return response()->json(['message' => 'QR eliminado correctamente']);
}
}