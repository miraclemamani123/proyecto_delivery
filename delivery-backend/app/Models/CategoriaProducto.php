<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaProducto extends Model
{
    protected $table = 'categorias_producto';
    public $timestamps = false;

    protected $fillable = [
        'negocio_id',
        'nombre',
        'activo',
    ];

    public function negocio()
    {
        return $this->belongsTo(Negocio::class, 'negocio_id');
    }

    public function productos()
    {
        return $this->hasMany(Producto::class, 'categoria_producto_id');
    }
}