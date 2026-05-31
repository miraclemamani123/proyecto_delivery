<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TarifaDelivery extends Model
{
    protected $table = 'tarifas_delivery';
    public $timestamps = false;

    protected $fillable = [
        'precio_por_km',
        'activo',
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'tarifa_id');
    }
}