<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistanciaPedido extends Model
{
    protected $table = 'distancias_pedido';
    public $timestamps = false;

    protected $fillable = [
        'pedido_id',
        'latitud_negocio',
        'longitud_negocio',
        'latitud_cliente',
        'longitud_cliente',
        'distancia_km',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }
}