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
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('negocio_id')->constrained('negocios')->onDelete('cascade');
            $table->foreignId('repartidor_id')->nullable()->constrained('repartidores')->onDelete('set null');
            $table->foreignId('estado_id')->constrained('estados_pedido');
            $table->string('direccion_entrega');
            $table->decimal('latitud_entrega', 10, 8);
            $table->decimal('longitud_entrega', 11, 8);
            $table->decimal('subtotal', 8, 2);
            $table->decimal('costo_delivery', 6, 2);
            $table->decimal('total', 8, 2);
            $table->enum('metodo_pago_pedido', ['yape'])->default('yape');
            $table->enum('metodo_pago_delivery', ['efectivo'])->default('efectivo');
            $table->string('comprobante_imagen')->nullable();
            $table->boolean('pago_confirmado')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};