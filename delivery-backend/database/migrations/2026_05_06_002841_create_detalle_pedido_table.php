<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->tinyInteger('cantidad')->unsigned()->default(1);
            $table->decimal('precio_unitario', 8, 2);
            $table->decimal('subtotal', 8, 2);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_pedido');
    }
};
