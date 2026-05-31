<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('distancias_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->decimal('latitud_negocio', 10, 8);
            $table->decimal('longitud_negocio', 11, 8);
            $table->decimal('latitud_cliente', 10, 8);
            $table->decimal('longitud_cliente', 11, 8);
            $table->decimal('distancia_km', 8, 2);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distancias_pedido');
    }
};