<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    public $timestamps = false;

    protected $fillable = [
        'negocio_id',
        'categoria_producto_id',
        'nombre',
        'descripcion',
        'precio',
        'imagen_url',
        'disponible',
    ];

    public function negocio()
    {
        return $this->belongsTo(Negocio::class, 'negocio_id');
    }

    public function categoria()
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_producto_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetallePedido::class, 'producto_id');
    }
}