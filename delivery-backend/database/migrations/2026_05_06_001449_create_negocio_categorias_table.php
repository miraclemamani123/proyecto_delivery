<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('negocio_categorias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negocio_id')->constrained('negocios')->onDelete('cascade');
            $table->foreignId('categoria_negocio_id')->constrained('categorias_negocio')->onDelete('cascade');
            $table->unique(['negocio_id', 'categoria_negocio_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('negocio_categorias');
    }
};