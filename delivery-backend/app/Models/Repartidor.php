<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Repartidor extends Model
{
    protected $table = 'repartidores';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'latitud',
        'longitud',
        'estado',
        'aprobado',
        'aprobado_por',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'repartidor_id');
    }

    public function ubicaciones()
    {
        return $this->hasMany(UbicacionRepartidor::class, 'repartidor_id');
    }

    public function asignaciones()
    {
        return $this->hasMany(Asignacion::class, 'repartidor_id');
    }
}