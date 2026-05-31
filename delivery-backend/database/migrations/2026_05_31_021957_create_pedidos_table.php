<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('restrict');
            $table->foreignId('negocio_id')->constrained('negocios')->onDelete('restrict');
            $table->foreignId('repartidor_id')->nullable()->constrained('repartidores')->onDelete('set null');
            $table->foreignId('tarifa_id')->constrained('tarifas_delivery')->onDelete('restrict');
            $table->enum('estado', ['pendiente', 'aceptado', 'en_preparacion', 'en_camino', 'entregado', 'rechazado'])->default('pendiente');
            $table->decimal('distancia_km', 8, 2)->nullable();
            $table->decimal('costo_delivery', 8, 2)->nullable();
            $table->text('observacion')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};