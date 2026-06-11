<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Negocio extends Model
{
    protected $table = 'negocios';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'categoria_negocio_id',
        'nombre',
        'descripcion',
        'direccion',
        'telefono',       // ← nuevo
        'latitud',
        'longitud',
        'imagen',
        'qr_yape',        // ← nuevo
        'qr_plin',        // ← nuevo
        'qr_tunki',       // ← nuevo
        'estado',
        'aprobado',
        'aprobado_por',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function categoria()
    {
        return $this->belongsTo(CategoriaNegocio::class, 'categoria_negocio_id');
    }

    public function productos()
    {
        return $this->hasMany(Producto::class, 'negocio_id');
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'negocio_id');
    }

    public function horarios()
    {
        return $this->hasMany(HorarioNegocio::class, 'negocio_id');
    }
}