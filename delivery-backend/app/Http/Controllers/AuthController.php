<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Cliente;
use App\Models\Negocio;
use App\Models\Repartidor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'rol'      => 'required|in:cliente,negocio,repartidor',
            'telefono' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'apellido' => $request->apellido,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'rol'      => $request->rol,
        ]);

        if ($request->rol === 'cliente') {
            Cliente::create([
                'usuario_id' => $user->id,
                'telefono'   => $request->telefono,
            ]);
        } elseif ($request->rol === 'repartidor') {
            Repartidor::create([
                'usuario_id' => $user->id,
                'aprobado'   => false,
                'estado'     => 'inactivo',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        // ✅ Bloquear repartidores no aprobados
        if ($user->rol === 'repartidor') {
            $repartidor = Repartidor::where('usuario_id', $user->id)->first();
            if (!$repartidor || !$repartidor->aprobado) {
                return response()->json([
                    'message' => 'Tu cuenta de repartidor está pendiente de aprobación por el administrador.',
                ], 403);
            }
        }

        // ✅ Bloquear negocios no aprobados
        if ($user->rol === 'negocio') {
            $negocio = Negocio::where('usuario_id', $user->id)->first();
            if (!$negocio || !$negocio->aprobado) {
                return response()->json([
                    'message' => 'Tu negocio está pendiente de aprobación por el administrador.',
                ], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}