<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    // Ver notificaciones del usuario
    public function index(Request $request)
    {
        $notificaciones = Notificacion::where('usuario_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notificaciones);
    }

    // Marcar notificación como leída
    public function marcarLeida(Request $request, $id)
    {
        $notificacion = Notificacion::where('id', $id)
            ->where('usuario_id', $request->user()->id)
            ->firstOrFail();

        $notificacion->leido = true;
        $notificacion->save();

        return response()->json([
            'message' => 'Notificación marcada como leída',
        ]);
    }

    // Marcar todas como leídas
    public function marcarTodasLeidas(Request $request)
    {
        Notificacion::where('usuario_id', $request->user()->id)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json([
            'message' => 'Todas las notificaciones marcadas como leídas',
        ]);
    }
}