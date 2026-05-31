<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->foreignId('repartidor_id')->constrained('repartidores')->onDelete('restrict');
            $table->enum('estado', ['asignado', 'en_camino', 'entregado'])->default('asignado');
            $table->timestamp('fecha_asignacion')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones');
    }
};