<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('negocios', function (Blueprint $table) {
        $table->string('telefono', 20)->nullable()->after('direccion');
    });

    Schema::table('clientes', function (Blueprint $table) {
        $table->string('telefono', 20)->nullable()->after('longitud');
    });

    \DB::statement("ALTER TABLE pedidos MODIFY COLUMN estado ENUM('pendiente','aceptado','en_preparacion','listo','en_camino','entregado','rechazado') NOT NULL DEFAULT 'pendiente'");
}

public function down(): void
{
    Schema::table('negocios', function (Blueprint $table) {
        $table->dropColumn('telefono');
    });

    Schema::table('clientes', function (Blueprint $table) {
        $table->dropColumn('telefono');
    });

    \DB::statement("ALTER TABLE pedidos MODIFY COLUMN estado ENUM('pendiente','aceptado','en_preparacion','en_camino','entregado','rechazado') NOT NULL DEFAULT 'pendiente'");
}
};
