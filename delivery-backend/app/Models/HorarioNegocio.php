<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HorarioNegocio extends Model
{
    protected $table = 'horarios_negocio';
    public $timestamps = false;

    protected $fillable = [
        'negocio_id',
        'dia',
        'hora_apertura',
        'hora_cierre',
        'activo',
    ];

    public function negocio()
    {
        return $this->belongsTo(Negocio::class, 'negocio_id');
    }
}