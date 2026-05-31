<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialEstado extends Model
{
    protected $table = 'historial_estados';
    public $timestamps = false;

    protected $fillable = [
        'pedido_id',
        'estado_anterior',
        'estado_nuevo',
        'cambiado_por_tipo',
        'cambiado_por_id',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function cambiador()
    {
        return $this->belongsTo(User::class, 'cambiado_por_id');
    }
}