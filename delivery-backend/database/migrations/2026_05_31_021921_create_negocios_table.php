<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('negocios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('categoria_negocio_id')->constrained('categorias_negocio')->onDelete('restrict');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('direccion', 255);
            $table->decimal('latitud', 10, 8);
            $table->decimal('longitud', 11, 8);
            $table->string('imagen', 255)->nullable();
            $table->enum('estado', ['abierto', 'cerrado'])->default('cerrado');
            $table->boolean('aprobado')->default(false);
            $table->foreignId('aprobado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('negocios');
    }
};