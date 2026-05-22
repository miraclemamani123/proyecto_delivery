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
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade')->unique();
            $table->decimal('distancia_km', 6, 2);
            $table->decimal('tarifa_base_aplicada', 6, 2);
            $table->decimal('precio_km_aplicado', 6, 2);
            $table->decimal('costo_calculado', 6, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distancias_pedido');
    }
};