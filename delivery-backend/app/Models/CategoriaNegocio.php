<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaNegocio extends Model
{
    protected $table = 'categorias_negocio';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'activo',
    ];

    public function negocios()
    {
        return $this->hasMany(Negocio::class, 'categoria_negocio_id');
    }
}