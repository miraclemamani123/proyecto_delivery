<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifas_delivery', function (Blueprint $table) {
            $table->id();
            $table->decimal('tarifa_base', 6, 2);
            $table->decimal('precio_por_km', 6, 2);
            $table->decimal('distancia_maxima_km', 6, 2)->default(10.00);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifas_delivery');
    }
};