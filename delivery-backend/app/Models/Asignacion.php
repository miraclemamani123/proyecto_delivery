<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asignacion extends Model
{
    protected $table = 'asignaciones';
    public $timestamps = false;

    protected $fillable = [
        'pedido_id',
        'repartidor_id',
        'estado',
        'fecha_asignacion',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function repartidor()
    {
        return $this->belongsTo(Repartidor::class, 'repartidor_id');
    }
}