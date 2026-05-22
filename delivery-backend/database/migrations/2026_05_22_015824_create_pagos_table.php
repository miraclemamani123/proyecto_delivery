<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade')->unique();
            $table->decimal('monto_subtotal', 8, 2);
            $table->decimal('costo_delivery', 6, 2);
            $table->decimal('monto_total', 8, 2);
            $table->decimal('comision_porcentaje', 5, 2);
            $table->decimal('comision_monto', 8, 2);
            $table->decimal('ganancia_negocio', 8, 2);
            $table->decimal('ganancia_repartidor', 6, 2);
            $table->enum('estado', ['pendiente', 'confirmado', 'completado'])->default('pendiente');
            $table->string('comprobante_yape')->nullable();
            $table->timestamp('fecha_pago')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
