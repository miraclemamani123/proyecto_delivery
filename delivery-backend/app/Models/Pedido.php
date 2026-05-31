<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'pedidos';
    public $timestamps = false;

    protected $fillable = [
        'cliente_id',
        'negocio_id',
        'repartidor_id',
        'tarifa_id',
        'estado',
        'distancia_km',
        'costo_delivery',
        'observacion',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function negocio()
    {
        return $this->belongsTo(Negocio::class, 'negocio_id');
    }

    public function repartidor()
    {
        return $this->belongsTo(Repartidor::class, 'repartidor_id');
    }

    public function tarifa()
    {
        return $this->belongsTo(TarifaDelivery::class, 'tarifa_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetallePedido::class, 'pedido_id');
    }

    public function asignacion()
    {
        return $this->hasOne(Asignacion::class, 'pedido_id');
    }

    public function distancia()
    {
        return $this->hasOne(DistanciaPedido::class, 'pedido_id');
    }

    public function historial()
    {
        return $this->hasMany(HistorialEstado::class, 'pedido_id');
    }

    public function pago()
    {
        return $this->hasOne(Pago::class, 'pedido_id');
    }
}