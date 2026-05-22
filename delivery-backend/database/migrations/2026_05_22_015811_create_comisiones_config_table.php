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
        Schema::create('comisiones_config', function (Blueprint $table) {
            $table->id();
            $table->decimal('porcentaje_plataforma', 5, 2)->default(15.00);
            $table->boolean('activo')->default(true);
            $table->timestamp('vigente_desde')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comisiones_config');
    }
};
