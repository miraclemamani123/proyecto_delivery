<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UbicacionRepartidor extends Model
{
    protected $table = 'ubicaciones_repartidor';
    public $timestamps = false;

    protected $fillable = [
        'repartidor_id',
        'latitud',
        'longitud',
    ];

    public function repartidor()
    {
        return $this->belongsTo(Repartidor::class, 'repartidor_id');
    }
}