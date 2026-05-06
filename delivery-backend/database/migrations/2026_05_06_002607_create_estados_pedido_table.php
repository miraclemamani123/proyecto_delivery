<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estados_pedido', function (Blueprint $table) {
            $table->id();
            $table->enum('nombre', [
                'pendiente',
                'asignado',
                'aceptado',
                'en_preparacion',
                'en_camino',
                'entregado',
                'rechazado',
                'cancelado'
            ])->unique();
            $table->string('descripcion')->nullable();
            $table->tinyInteger('orden')->unsigned();
            $table->string('color_hex', 7)->default('#000000');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estados_pedido');
    }
};